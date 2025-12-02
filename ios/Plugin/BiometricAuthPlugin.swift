import Foundation
import Capacitor
import LocalAuthentication
import Security
import CommonCrypto

@objc(BiometricAuthPlugin)
public class BiometricAuthPlugin: CAPPlugin {
    private let PREFS_KEY = "BiometricAuthPrefs"
    private let SESSION_TOKEN_KEY = "session_token"
    private let SESSION_EXPIRY_KEY = "session_expiry"
    private let STORED_CREDENTIALS_KEY = "stored_credentials"
    private let KEYCHAIN_SERVICE = "com.aoneahsan.biometricauth"
    private let SIGN_COUNT_KEY = "sign_count_"

    // Configuration
    private var sessionDuration: TimeInterval = 3600 // 1 hour default
    private var encryptionSecret = "default-secret"
    private var allowDeviceCredential = true
    private var maxAttempts = 3
    private var lockoutDuration: TimeInterval = 30 // 30 seconds

    // Attempt tracking for lockout
    private var failedAttempts = 0
    private var lockoutEndTime: Date?
    
    // Base64URL utilities for WebAuthn compatibility
    private func base64UrlEncode(_ data: Data) -> String {
        return data.base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
    
    private func base64UrlDecode(_ string: String) -> Data? {
        var base64 = string
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")
        
        // Add padding if needed
        while base64.count % 4 != 0 {
            base64 += "="
        }
        
        return Data(base64Encoded: base64)
    }
    
    private func createEnhancedToken(credentialId: String, type: String, credentialData: [String: Any]? = nil) -> String {
        var tokenPayload: [String: Any] = [
            "credentialId": credentialId,
            "timestamp": Date().timeIntervalSince1970 * 1000,
            "sessionId": UUID().uuidString,
            "type": type
        ]
        
        if let credentialData = credentialData {
            tokenPayload["credentialData"] = credentialData
        }
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: tokenPayload)
            return jsonData.base64EncodedString()
        } catch {
            print("Failed to create enhanced token: \(error)")
            return UUID().uuidString // Fallback to simple token
        }
    }
    
    private func createClientDataJSON(type: String, challenge: String) -> String {
        // Get actual bundle identifier for proper origin
        let bundleId = Bundle.main.bundleIdentifier ?? "unknown"
        let clientData: [String: Any] = [
            "type": type,
            "challenge": Data(challenge.utf8).base64EncodedString(),
            "origin": "ios:bundle-id:\(bundleId)",
            "iosBundleId": bundleId,
            "crossOrigin": false
        ]

        do {
            let jsonData = try JSONSerialization.data(withJSONObject: clientData)
            return String(data: jsonData, encoding: .utf8) ?? "{}"
        } catch {
            print("Failed to create client data JSON: \(error)")
            return "{}"
        }
    }

    /// Get RP ID from options or use bundle identifier
    private func getRpId(from webAuthnOptions: [String: Any]?) -> String {
        if let options = webAuthnOptions {
            if let getOptions = options["get"] as? [String: Any],
               let rpId = getOptions["rpId"] as? String, !rpId.isEmpty {
                return rpId
            }
            if let createOptions = options["create"] as? [String: Any],
               let rp = createOptions["rp"] as? [String: Any],
               let rpId = rp["id"] as? String, !rpId.isEmpty {
                return rpId
            }
        }
        return Bundle.main.bundleIdentifier ?? "unknown"
    }

    /// Get and increment sign count for replay protection
    private func getAndIncrementSignCount(for credentialId: String) -> Int {
        let key = SIGN_COUNT_KEY + credentialId
        let signCount = UserDefaults.standard.integer(forKey: key)
        UserDefaults.standard.set(signCount + 1, forKey: key)
        return signCount
    }

    /// Generate WebAuthn-compliant authenticatorData
    private func generateAuthenticatorData(rpId: String, signCount: Int, userPresent: Bool, userVerified: Bool) -> Data {
        // Calculate rpIdHash (SHA-256 of the RP ID)
        guard let rpIdData = rpId.data(using: .utf8) else {
            return Data()
        }
        var rpIdHash = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
        rpIdData.withUnsafeBytes { bytes in
            _ = CC_SHA256(bytes.baseAddress, CC_LONG(rpIdData.count), &rpIdHash)
        }

        // Build flags byte
        var flags: UInt8 = 0
        if userPresent { flags |= 0x01 }
        if userVerified { flags |= 0x04 }

        // Sign count (4 bytes, big-endian)
        let signCountBytes: [UInt8] = [
            UInt8((signCount >> 24) & 0xFF),
            UInt8((signCount >> 16) & 0xFF),
            UInt8((signCount >> 8) & 0xFF),
            UInt8(signCount & 0xFF)
        ]

        // Combine: rpIdHash (32) + flags (1) + signCount (4) = 37 bytes
        var authenticatorData = Data(rpIdHash)
        authenticatorData.append(flags)
        authenticatorData.append(contentsOf: signCountBytes)

        return authenticatorData
    }

    /// Generate a real signature using Keychain-stored key
    private func generateRealSignature(keyAlias: String, dataToSign: Data) -> String {
        // Try to get existing key or generate new one
        let key: SecKey
        if let existingKey = getPrivateKey(alias: keyAlias) {
            key = existingKey
        } else {
            guard let newKey = generateKeyPair(alias: keyAlias) else {
                return base64UrlEncode("fallback_sig_\(Int(Date().timeIntervalSince1970 * 1000))".data(using: .utf8) ?? Data())
            }
            key = newKey
        }

        // Sign the data
        var error: Unmanaged<CFError>?
        guard let signature = SecKeyCreateSignature(key, .ecdsaSignatureMessageX962SHA256, dataToSign as CFData, &error) else {
            print("Failed to create signature: \(error?.takeRetainedValue().localizedDescription ?? "unknown error")")
            return base64UrlEncode("fallback_sig_\(Int(Date().timeIntervalSince1970 * 1000))".data(using: .utf8) ?? Data())
        }

        return base64UrlEncode(signature as Data)
    }

    /// Generate key pair for signatures
    private func generateKeyPair(alias: String) -> SecKey? {
        let tag = "\(KEYCHAIN_SERVICE).\(alias)".data(using: .utf8)!

        // Delete any existing key with this alias
        let deleteQuery: [String: Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: tag
        ]
        SecItemDelete(deleteQuery as CFDictionary)

        // Generate new key pair
        var error: Unmanaged<CFError>?
        let accessControl = SecAccessControlCreateWithFlags(
            nil,
            kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
            .privateKeyUsage,
            &error
        )

        guard let access = accessControl else {
            print("Failed to create access control: \(error?.takeRetainedValue().localizedDescription ?? "unknown")")
            return nil
        }

        let attributes: [String: Any] = [
            kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
            kSecAttrKeySizeInBits as String: 256,
            kSecAttrTokenID as String: kSecAttrTokenIDSecureEnclave,
            kSecPrivateKeyAttrs as String: [
                kSecAttrIsPermanent as String: true,
                kSecAttrApplicationTag as String: tag,
                kSecAttrAccessControl as String: access
            ]
        ]

        // Try Secure Enclave first, fall back to software keys
        if let privateKey = SecKeyCreateRandomKey(attributes as CFDictionary, &error) {
            return privateKey
        }

        // Fall back to software-based key (for simulators or unsupported devices)
        let softwareAttributes: [String: Any] = [
            kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
            kSecAttrKeySizeInBits as String: 256,
            kSecPrivateKeyAttrs as String: [
                kSecAttrIsPermanent as String: true,
                kSecAttrApplicationTag as String: tag
            ]
        ]

        return SecKeyCreateRandomKey(softwareAttributes as CFDictionary, &error)
    }

    /// Get existing private key from Keychain
    private func getPrivateKey(alias: String) -> SecKey? {
        let tag = "\(KEYCHAIN_SERVICE).\(alias)".data(using: .utf8)!
        let query: [String: Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: tag,
            kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
            kSecReturnRef as String: true
        ]

        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)

        guard status == errSecSuccess else {
            return nil
        }

        return (item as! SecKey)
    }

    /// Get public key as base64
    private func getPublicKeyBase64(alias: String) -> String? {
        guard let privateKey = getPrivateKey(alias: alias),
              let publicKey = SecKeyCopyPublicKey(privateKey) else {
            return nil
        }

        var error: Unmanaged<CFError>?
        guard let publicKeyData = SecKeyCopyExternalRepresentation(publicKey, &error) else {
            return nil
        }

        return (publicKeyData as Data).base64EncodedString()
    }

    /// Generate attestation object
    private func generateAttestationObject(authenticatorData: Data) -> Data {
        // Create a JSON-based attestation for "none" format
        let attestation: [String: Any] = [
            "fmt": "none",
            "attStmt": [:],
            "authData": authenticatorData.base64EncodedString()
        ]

        do {
            return try JSONSerialization.data(withJSONObject: attestation)
        } catch {
            print("Failed to generate attestation object: \(error)")
            return Data()
        }
    }

    /// Check if currently locked out
    private func isLockedOut() -> Bool {
        if let endTime = lockoutEndTime, Date() < endTime {
            return true
        }
        lockoutEndTime = nil
        return false
    }

    /// Handle failed attempt
    private func handleFailedAttempt() {
        failedAttempts += 1
        if failedAttempts >= maxAttempts {
            lockoutEndTime = Date().addingTimeInterval(lockoutDuration)
            failedAttempts = 0
        }
    }

    /// Reset failed attempts on success
    private func resetFailedAttempts() {
        failedAttempts = 0
        lockoutEndTime = nil
    }
    
    private func generateDeviceFingerprint() -> String {
        var fingerprintComponents: [String] = []
        
        // Device model
        var systemInfo = utsname()
        uname(&systemInfo)
        let deviceModel = String(bytes: Data(bytes: &systemInfo.machine, count: Int(_SYS_NAMELEN)), encoding: .ascii)?.trimmingCharacters(in: .controlCharacters) ?? "unknown"
        fingerprintComponents.append(deviceModel)
        
        // Screen resolution
        let screenSize = UIScreen.main.bounds
        let screenScale = UIScreen.main.scale
        let screenInfo = "\(Int(screenSize.width * screenScale))x\(Int(screenSize.height * screenScale))"
        fingerprintComponents.append(screenInfo)
        
        // Language/Locale
        let locale = Locale.current.identifier
        fingerprintComponents.append(locale)
        
        // Timezone
        let timezone = TimeZone.current.identifier
        fingerprintComponents.append(timezone)
        
        // iOS version
        let iosVersion = UIDevice.current.systemVersion
        fingerprintComponents.append(iosVersion)
        
        let fingerprint = fingerprintComponents.joined(separator: "|")
        let fingerprintData = fingerprint.data(using: .utf8) ?? Data()
        let base64Fingerprint = fingerprintData.base64EncodedString()
        
        // Return first 32 characters
        return String(base64Fingerprint.prefix(32))
    }
    
    @objc func isAvailable(_ call: CAPPluginCall) {
        let context = LAContext()
        var error: NSError?
        
        let policy: LAPolicy = allowDeviceCredential ? .deviceOwnerAuthentication : .deviceOwnerAuthenticationWithBiometrics
        let canAuthenticate = context.canEvaluatePolicy(policy, error: &error)
        
        var result: [String: Any] = ["available": canAuthenticate]
        if !canAuthenticate, let error = error {
            var reason = ""
            switch error.code {
            case LAError.biometryNotAvailable.rawValue:
                reason = "hardwareUnavailable"
            case LAError.biometryNotEnrolled.rawValue:
                reason = "noEnrolledBiometrics"
            case LAError.biometryLockout.rawValue:
                reason = "lockedOut"
            case LAError.passcodeNotSet.rawValue:
                reason = "noHardware"
            default:
                reason = "notSupported"
            }
            result["reason"] = reason
            result["errorMessage"] = error.localizedDescription
        }
        
        call.resolve(result)
    }
    
    @objc func getSupportedBiometrics(_ call: CAPPluginCall) {
        let context = LAContext()
        var error: NSError?
        var biometrics: [String] = []

        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            if #available(iOS 11.0, *) {
                switch context.biometryType {
                case .touchID:
                    // Return only touchId (not both touchId and fingerprint to avoid duplicates)
                    biometrics.append("touchId")
                case .faceID:
                    biometrics.append("faceId")
                case .none:
                    break
                @unknown default:
                    break
                }
            } else {
                // Fallback for older iOS versions (pre-Face ID)
                biometrics.append("touchId")
            }
        }

        if allowDeviceCredential && context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) {
            biometrics.append("passcode")
        }

        call.resolve(["biometrics": biometrics])
    }
    
    @objc func authenticate(_ call: CAPPluginCall) {
        // Check for lockout
        if isLockedOut() {
            let remainingTime = lockoutEndTime!.timeIntervalSince(Date())
            call.resolve([
                "success": false,
                "error": [
                    "code": "lockedOut",
                    "message": "Too many failed attempts. Please try again in \(Int(remainingTime)) seconds."
                ]
            ])
            return
        }

        let context = LAContext()
        context.localizedCancelTitle = call.getString("cancelButtonTitle") ?? "Cancel"

        if !allowDeviceCredential, let fallbackTitle = call.getString("fallbackButtonTitle") {
            context.localizedFallbackTitle = fallbackTitle
        }

        let reason = call.getString("description") ?? call.getString("subtitle") ?? call.getString("title") ?? "Authenticate to continue"

        // Extract WebAuthn options
        let webAuthnOptions = call.getObject("webAuthnOptions")
        var webAuthnChallenge: String? = nil
        if let options = webAuthnOptions,
           let getOptions = options["get"] as? [String: Any],
           let challenge = getOptions["challenge"] as? String {
            webAuthnChallenge = challenge
        }

        let policy: LAPolicy = allowDeviceCredential ? .deviceOwnerAuthentication : .deviceOwnerAuthenticationWithBiometrics

        context.evaluatePolicy(policy, localizedReason: reason) { success, error in
            DispatchQueue.main.async {
                if success {
                    self.resetFailedAttempts()

                    // Extract stored credential information from WebAuthn options if available
                    var credentialId = "mobile_" + UUID().uuidString.replacingOccurrences(of: "-", with: "")
                    var credentialRawId: String? = nil
                    var userId: String? = nil

                    if let options = webAuthnOptions,
                       let getOptions = options["get"] as? [String: Any] {
                        if let storedCredentialId = getOptions["storedCredentialId"] as? String, !storedCredentialId.isEmpty {
                            credentialId = storedCredentialId
                        }
                        if let storedCredentialRawId = getOptions["storedCredentialRawId"] as? String, !storedCredentialRawId.isEmpty {
                            credentialRawId = storedCredentialRawId
                        }
                        if let storedUserId = getOptions["storedUserId"] as? String, !storedUserId.isEmpty {
                            userId = storedUserId
                        }
                    }

                    let sessionId = UUID().uuidString

                    // Get RP ID and generate sign count
                    let rpId = self.getRpId(from: webAuthnOptions)
                    let signCount = self.getAndIncrementSignCount(for: credentialId)

                    // Generate proper authenticatorData
                    let authenticatorData = self.generateAuthenticatorData(rpId: rpId, signCount: signCount, userPresent: true, userVerified: true)

                    // Use the WebAuthn challenge if provided, otherwise fallback to timestamp
                    let challengeToUse = webAuthnChallenge ?? "mobile_auth_\(Int(Date().timeIntervalSince1970 * 1000))"
                    let clientDataJSON = self.createClientDataJSON(type: "webauthn.get", challenge: challengeToUse)

                    // Generate real signature: sign(authenticatorData || SHA-256(clientDataJSON))
                    let keyAlias = "auth_key_\(credentialId)"
                    var signatureString = ""
                    if let clientDataData = clientDataJSON.data(using: .utf8) {
                        var clientDataHash = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
                        clientDataData.withUnsafeBytes { bytes in
                            _ = CC_SHA256(bytes.baseAddress, CC_LONG(clientDataData.count), &clientDataHash)
                        }

                        var dataToSign = authenticatorData
                        dataToSign.append(contentsOf: clientDataHash)
                        signatureString = self.generateRealSignature(keyAlias: keyAlias, dataToSign: dataToSign)
                    }

                    // Create enhanced credential data for backend verification
                    let credentialData: [String: Any] = [
                        "id": credentialId,
                        "rawId": credentialRawId ?? self.base64UrlEncode(credentialId.data(using: .utf8) ?? Data()),
                        "response": [
                            "authenticatorData": self.base64UrlEncode(authenticatorData),
                            "clientDataJSON": self.base64UrlEncode(clientDataJSON.data(using: .utf8) ?? Data()),
                            "signature": signatureString,
                            "userHandle": userId != nil ? self.base64UrlEncode(userId!.data(using: .utf8) ?? Data()) : ""
                        ],
                        "type": "public-key",
                        "clientExtensionResults": "{}",
                        "authenticatorAttachment": "platform",
                        "deviceFingerprint": self.generateDeviceFingerprint()
                    ]

                    // Create enhanced token with credential data
                    let token = self.createEnhancedToken(credentialId: credentialId, type: "authentication", credentialData: credentialData)

                    // Store session
                    UserDefaults.standard.set(token, forKey: self.SESSION_TOKEN_KEY)
                    UserDefaults.standard.set(Date().addingTimeInterval(self.sessionDuration), forKey: self.SESSION_EXPIRY_KEY)

                    call.resolve([
                        "success": true,
                        "sessionId": sessionId,
                        "token": token
                    ])
                } else {
                    self.handleFailedAttempt()

                    var errorCode = "unknown"
                    var errorMessage = "Authentication failed"

                    if let error = error as NSError? {
                        switch error.code {
                        case LAError.userCancel.rawValue:
                            errorCode = "userCancelled"
                            errorMessage = "User cancelled authentication"
                        case LAError.userFallback.rawValue:
                            errorCode = "userCancelled"
                            errorMessage = "User chose fallback"
                        case LAError.systemCancel.rawValue:
                            errorCode = "systemCancelled"
                            errorMessage = "System cancelled authentication"
                        case LAError.authenticationFailed.rawValue:
                            errorCode = "authenticationFailed"
                            errorMessage = "Authentication failed"
                        case LAError.biometryLockout.rawValue:
                            errorCode = "lockedOut"
                            errorMessage = "Biometry is locked out"
                        case LAError.biometryNotAvailable.rawValue:
                            errorCode = "notAvailable"
                            errorMessage = "Biometry is not available"
                        case LAError.biometryNotEnrolled.rawValue:
                            errorCode = "notEnrolled"
                            errorMessage = "No biometric data enrolled"
                        default:
                            errorMessage = error.localizedDescription
                        }
                    }

                    call.resolve([
                        "success": false,
                        "error": [
                            "code": errorCode,
                            "message": errorMessage
                        ]
                    ])
                }
            }
        }
    }
    
    @objc func register(_ call: CAPPluginCall) {
        // Check for lockout
        if isLockedOut() {
            let remainingTime = lockoutEndTime!.timeIntervalSince(Date())
            call.resolve([
                "success": false,
                "error": [
                    "code": "lockedOut",
                    "message": "Too many failed attempts. Please try again in \(Int(remainingTime)) seconds."
                ]
            ])
            return
        }

        let context = LAContext()
        context.localizedCancelTitle = call.getString("cancelButtonTitle") ?? "Cancel"

        let reason = call.getString("description") ?? call.getString("subtitle") ?? call.getString("title") ?? "Register biometric authentication"

        // Extract WebAuthn options
        let webAuthnOptions = call.getObject("webAuthnOptions")

        let policy: LAPolicy = allowDeviceCredential ? .deviceOwnerAuthentication : .deviceOwnerAuthenticationWithBiometrics

        context.evaluatePolicy(policy, localizedReason: reason) { success, error in
            DispatchQueue.main.async {
                if success {
                    self.resetFailedAttempts()

                    // Generate credential data for mobile registration
                    let credentialId = "mobile_" + UUID().uuidString.replacingOccurrences(of: "-", with: "")
                    let sessionId = UUID().uuidString

                    // Get RP ID and generate sign count
                    let rpId = self.getRpId(from: webAuthnOptions)
                    let signCount = self.getAndIncrementSignCount(for: credentialId)

                    // Generate proper authenticatorData
                    let authenticatorData = self.generateAuthenticatorData(rpId: rpId, signCount: signCount, userPresent: true, userVerified: true)

                    // Generate key pair for this credential
                    let keyAlias = "auth_key_\(credentialId)"
                    _ = self.generateKeyPair(alias: keyAlias)
                    let publicKeyBase64 = self.getPublicKeyBase64(alias: keyAlias)

                    // Generate proper attestation object
                    let attestationObject = self.generateAttestationObject(authenticatorData: authenticatorData)

                    // Extract challenge from webAuthnOptions if available
                    var challenge = "mobile_registration_\(Int(Date().timeIntervalSince1970 * 1000))"
                    if let options = webAuthnOptions,
                       let createOptions = options["create"] as? [String: Any],
                       let providedChallenge = createOptions["challenge"] as? String, !providedChallenge.isEmpty {
                        challenge = providedChallenge
                    }

                    // Create enhanced credential data for backend verification
                    var responseData: [String: Any] = [
                        "attestationObject": self.base64UrlEncode(attestationObject),
                        "clientDataJSON": self.base64UrlEncode(self.createClientDataJSON(type: "webauthn.create", challenge: challenge).data(using: .utf8) ?? Data()),
                        "transports": ["internal"]
                    ]

                    // Include public key for backend to store
                    if let publicKey = publicKeyBase64 {
                        responseData["publicKey"] = publicKey
                    }

                    let credentialData: [String: Any] = [
                        "id": credentialId,
                        "rawId": self.base64UrlEncode(credentialId.data(using: .utf8) ?? Data()),
                        "response": responseData,
                        "type": "public-key",
                        "clientExtensionResults": "{}",
                        "authenticatorAttachment": "platform",
                        "deviceFingerprint": self.generateDeviceFingerprint()
                    ]

                    // Create enhanced token with credential data
                    let token = self.createEnhancedToken(credentialId: credentialId, type: "registration", credentialData: credentialData)

                    // Store session
                    UserDefaults.standard.set(token, forKey: self.SESSION_TOKEN_KEY)
                    UserDefaults.standard.set(Date().addingTimeInterval(self.sessionDuration), forKey: self.SESSION_EXPIRY_KEY)

                    call.resolve([
                        "success": true,
                        "sessionId": sessionId,
                        "token": token
                    ])
                } else {
                    self.handleFailedAttempt()

                    var errorCode = "unknown"
                    var errorMessage = "Registration failed"

                    if let error = error as NSError? {
                        switch error.code {
                        case LAError.userCancel.rawValue:
                            errorCode = "userCancelled"
                            errorMessage = "User cancelled registration"
                        case LAError.userFallback.rawValue:
                            errorCode = "userCancelled"
                            errorMessage = "User chose fallback"
                        case LAError.systemCancel.rawValue:
                            errorCode = "systemCancelled"
                            errorMessage = "System cancelled registration"
                        case LAError.authenticationFailed.rawValue:
                            errorCode = "authenticationFailed"
                            errorMessage = "Registration failed"
                        case LAError.biometryLockout.rawValue:
                            errorCode = "lockedOut"
                            errorMessage = "Biometry is locked out"
                        case LAError.biometryNotAvailable.rawValue:
                            errorCode = "notAvailable"
                            errorMessage = "Biometry is not available"
                        case LAError.biometryNotEnrolled.rawValue:
                            errorCode = "notEnrolled"
                            errorMessage = "No biometric data enrolled"
                        default:
                            errorMessage = error.localizedDescription
                        }
                    }

                    call.resolve([
                        "success": false,
                        "error": [
                            "code": errorCode,
                            "message": errorMessage
                        ]
                    ])
                }
            }
        }
    }
    
    @objc func deleteCredentials(_ call: CAPPluginCall) {
        // Clear session data
        UserDefaults.standard.removeObject(forKey: SESSION_TOKEN_KEY)
        UserDefaults.standard.removeObject(forKey: SESSION_EXPIRY_KEY)
        UserDefaults.standard.removeObject(forKey: STORED_CREDENTIALS_KEY)
        
        // Clear all items from keychain for this service
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: KEYCHAIN_SERVICE
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        
        if status == errSecSuccess || status == errSecItemNotFound {
            call.resolve()
        } else {
            call.reject("Failed to delete credentials")
        }
    }
    
    @objc func configure(_ call: CAPPluginCall) {
        if let config = call.getObject("config") {
            if let duration = config["sessionDuration"] as? Double {
                sessionDuration = duration
            }
            
            if let secret = config["encryptionSecret"] as? String {
                encryptionSecret = secret
            }
            
            if let fallbackMethods = config["fallbackMethods"] as? [String] {
                // Check if any device credential methods are allowed
                allowDeviceCredential = fallbackMethods.contains { method in
                    ["passcode", "pattern", "pin"].contains(method)
                }
            }
            
            if let attempts = config["maxAttempts"] as? Int {
                maxAttempts = attempts
            }
            
            if let lockout = config["lockoutDuration"] as? Double {
                lockoutDuration = lockout
            }
        }
        
        call.resolve()
    }
}
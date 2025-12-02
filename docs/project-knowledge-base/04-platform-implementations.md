# Platform Implementations

**Last Updated:** 2025-12-02

## Web Platform (WebAuthn)

### Technology
- W3C WebAuthn (Web Authentication API)
- PublicKeyCredential API
- Web Crypto API for encryption

### Files
- `src/adapters/WebAdapter.ts` - Main adapter
- `src/web.ts` - Legacy Capacitor WebPlugin
- `src/utils/webauthn.ts` - WebAuthn utilities

### Features
| Feature | Implementation |
|---------|---------------|
| Availability Check | PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable() |
| Registration | navigator.credentials.create() |
| Authentication | navigator.credentials.get() |
| Credential Storage | localStorage with key `biometric_credential_ids` |
| Session Storage | In-memory Map + sessionStorage |
| Encryption | AES-256-GCM with PBKDF2 key derivation |

### Browser Compatibility
| Browser | Min Version | Features |
|---------|-------------|----------|
| Chrome | 67+ | Windows Hello, Touch ID |
| Edge | 79+ | Windows Hello |
| Safari | 14+ | Touch ID, Face ID |
| Firefox | 60+ | Windows Hello |

### WebAuthn Flow

**Registration:**
1. Generate challenge (32 bytes random)
2. Create credential options (rp, user, pubKeyCredParams)
3. Call navigator.credentials.create()
4. Store credential ID in localStorage
5. Generate session token with credential data
6. Return success with token

**Authentication:**
1. Retrieve stored credential IDs
2. Create assertion options with allowCredentials
3. Call navigator.credentials.get()
4. Verify response
5. Generate session token
6. Return success with token

### Storage Keys
| Key | Content |
|-----|---------|
| `biometric_credential_ids` | JSON array of credential IDs |
| `biometric_credential_ids_{userId}` | User-specific credentials |
| `biometric_auth_*` | Session data |

---

## iOS Platform (LocalAuthentication)

### Technology
- LocalAuthentication framework
- LAContext for biometric evaluation
- Keychain for secure storage

### Files
- `ios/Plugin/BiometricAuthPlugin.swift`
- `src/adapters/CapacitorAdapter.ts` (bridge)

### Features
| Feature | Implementation |
|---------|---------------|
| Touch ID | LABiometryType.touchID |
| Face ID | LABiometryType.faceID |
| Passcode Fallback | deviceOwnerAuthentication policy |
| Biometric Only | deviceOwnerAuthenticationWithBiometrics policy |

### Policies
| Policy | Description |
|--------|-------------|
| deviceOwnerAuthenticationWithBiometrics | Biometric only, no fallback |
| deviceOwnerAuthentication | Biometric with passcode fallback |

### Error Mapping
| LAError | BiometricErrorCode |
|---------|-------------------|
| userCancel | userCancelled |
| userFallback | userCancelled |
| systemCancel | systemCancelled |
| authenticationFailed | authenticationFailed |
| biometryLockout | lockedOut |
| biometryNotAvailable | notAvailable |
| biometryNotEnrolled | notEnrolled |
| passcodeNotSet | notAvailable |

### Storage
| Store | Key | Content |
|-------|-----|---------|
| Keychain | biometric_credentials | Encrypted credential data |
| UserDefaults | SESSION_TOKEN_KEY | Current session token |
| UserDefaults | SESSION_EXPIRY_KEY | Session expiration timestamp |

### Info.plist Requirements
```xml
<key>NSFaceIDUsageDescription</key>
<string>Use Face ID for secure authentication</string>
```

### Device Fingerprinting
- Device model (utsname)
- Screen resolution and scale
- Locale identifier
- Timezone identifier
- iOS version

---

## Android Platform (BiometricPrompt)

### Technology
- AndroidX BiometricPrompt API
- Android Keystore for cryptographic operations
- SharedPreferences for session storage

### Files
- `android/src/main/java/com/aoneahsan/capacitor/biometricauth/BiometricAuthPlugin.java`
- `src/adapters/CapacitorAdapter.ts` (bridge)

### Features
| Feature | Implementation |
|---------|---------------|
| Fingerprint | BIOMETRIC_STRONG |
| Face Recognition | BIOMETRIC_STRONG |
| Device Credential | DEVICE_CREDENTIAL authenticator |
| Cryptographic Auth | CryptoObject with Signature/Cipher/Mac |

### Biometric Classes
| Class | Strength | Examples |
|-------|----------|----------|
| Class 3 (Strong) | High | Fingerprint, secure face recognition |
| Class 2 (Weak) | Medium | Some face recognition |
| Class 1 | Low | N/A |

### Cryptographic Operations

**Signature:**
```java
// Algorithms: SHA256withRSA, SHA256withECDSA, SHA512withRSA, SHA512withECDSA
KeyPairGenerator.getInstance("EC", "AndroidKeyStore")
Signature.getInstance("SHA256withECDSA")
```

**Cipher:**
```java
// AES-256-GCM encryption
KeyGenerator.getInstance("AES", "AndroidKeyStore")
Cipher.getInstance("AES/GCM/NoPadding")
```

**MAC:**
```java
// HMAC-SHA256
KeyGenerator.getInstance("HmacSHA256", "AndroidKeyStore")
Mac.getInstance("HmacSHA256")
```

### Key Properties
| Property | Description |
|----------|-------------|
| setUserAuthenticationRequired | Require biometric for key use |
| setUserAuthenticationValidityDurationSeconds | Key validity after auth |
| setInvalidatedByBiometricEnrollment | Invalidate on new enrollment |

### Error Mapping
| BiometricPrompt Error | BiometricErrorCode |
|----------------------|-------------------|
| ERROR_HW_UNAVAILABLE | notAvailable |
| ERROR_UNABLE_TO_PROCESS | authenticationFailed |
| ERROR_TIMEOUT | timeout |
| ERROR_NO_SPACE | unknown |
| ERROR_CANCELED | systemCancelled |
| ERROR_LOCKOUT | lockedOut |
| ERROR_LOCKOUT_PERMANENT | lockedOut |
| ERROR_USER_CANCELED | userCancelled |
| ERROR_NO_BIOMETRICS | notEnrolled |
| ERROR_HW_NOT_PRESENT | notAvailable |
| ERROR_NEGATIVE_BUTTON | userCancelled |
| ERROR_NO_DEVICE_CREDENTIAL | notAvailable |

### AndroidManifest Requirements
```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

### Storage
| Store | Content |
|-------|---------|
| SharedPreferences | Session tokens, credential metadata |
| Android Keystore | Cryptographic keys |

### Device Fingerprinting
- User agent
- Screen resolution
- Language/Locale
- Timezone
- Device model (Build.MODEL)

---

## Electron Platform

### Technology
- Electron systemPreferences API
- macOS Touch ID integration

### Files
- `src/adapters/ElectronAdapter.ts`

### Features
| Feature | Platform | Implementation |
|---------|----------|---------------|
| Touch ID | macOS | systemPreferences.promptTouchID() |
| Windows Hello | Windows | Planned (not implemented) |

### Detection
```typescript
if (typeof process !== 'undefined' &&
    process.versions &&
    process.versions.electron) {
  // Electron environment
}
```

### macOS Touch ID Flow
1. Check systemPreferences.canPromptTouchID()
2. Call promptTouchID(reason)
3. Return success/failure

### Limitations
- No credential storage (system-managed)
- Windows Hello not yet implemented
- Linux not supported

---

## Platform Detection Logic

### Priority Order
1. Check for Capacitor (window.Capacitor)
2. Check for Cordova (window.cordova)
3. Check for Electron (process.versions.electron)
4. Check for Node.js (process.versions.node)
5. Default to Web (window/document exists)

### Detection Code
```typescript
// Capacitor
if (window.Capacitor?.isNativePlatform?.()) {
  return window.Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
}

// Cordova
if (window.cordova?.platformId) {
  return window.cordova.platformId;
}

// Electron
if (process?.versions?.electron) {
  return 'electron';
}

// Web
if (typeof window !== 'undefined') {
  return 'web';
}
```

### Adapter Selection
| Platform Detected | Adapter Used |
|-------------------|--------------|
| ios (Capacitor) | CapacitorAdapter |
| android (Capacitor) | CapacitorAdapter |
| ios (Cordova) | CapacitorAdapter |
| android (Cordova) | CapacitorAdapter |
| electron | ElectronAdapter |
| web | WebAdapter |

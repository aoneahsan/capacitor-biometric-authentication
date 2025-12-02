# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Full WebAuthn options support for web platform
- Real cryptographic signature generation on Android using Android Keystore ECDSA keys
- Real cryptographic signature generation on iOS using Keychain SecKey ECDSA keys
- WebAuthn-compliant authenticatorData generation on Android and iOS
- Proper attestation object generation with CBOR encoding on Android and iOS
- Public key export in registration responses for backend verification
- Lockout enforcement on iOS with configurable maxAttempts and lockoutDuration
- Dynamic origin generation using actual app package/bundle identifier

### Fixed
- **CRITICAL**: iOS `register()` method now properly exposed in Objective-C bridge
- Session duration units standardized to seconds (was incorrectly milliseconds in core)
- Memory leak in BiometricAuthCore from uncleaned setTimeout callbacks
- Hardcoded WebAuthn origin in Android replaced with dynamic package-based origin
- Hardcoded WebAuthn origin in iOS replaced with dynamic bundle identifier
- Mock "mobile_signature" replaced with real ECDSA signatures on both platforms
- Mock "mobile_attestation" replaced with real attestation objects on both platforms
- Empty authenticatorData replaced with proper WebAuthn-compliant format
- Duplicate biometrics return in iOS (was returning both "touchId" and "fingerprint")
- Duplicate imports in Android BiometricAuthPlugin.java
- Session timeout now properly cleared on logout and new authentication

### Security
- All cryptographic operations now use platform-specific secure enclaves (Android Keystore, iOS Keychain)
- Signatures are generated using biometric-protected ECDSA P-256 keys
- Challenge data is properly signed for WebAuthn compliance
- Sign count is tracked and incremented for replay attack prevention
- New `webAuthnOptions` property in `BiometricAuthOptions` interface
- Separate `register()` method for explicit credential creation (web platform)
- Support for all WebAuthn creation options:
  - Custom challenge from server
  - Full control over relying party (RP) configuration
  - User information customization
  - Public key algorithm preferences
  - Authenticator selection criteria
  - Attestation options
  - Credential exclusion lists
  - WebAuthn extensions
- Support for all WebAuthn authentication options:
  - Custom challenge handling
  - Allowed credentials specification
  - User verification requirements
  - Timeout configuration
- Utility functions for WebAuthn data conversion
- Credential storage mechanism for managing registered credentials
- Intelligent authentication flow that automatically chooses between registration and authentication

### Changed
- `authenticate()` method now intelligently determines whether to register new credentials or authenticate existing ones
- Web implementation now properly uses `navigator.credentials.get()` for authentication
- Improved error handling with specific WebAuthn error mapping

### Fixed
- WebAuthn implementation now follows the specification correctly
- Proper separation between credential creation and assertion

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Capacitor Biometric Auth plugin
- Web implementation using Web Authentication API (WebAuthn)
- Android native implementation using BiometricPrompt API
- iOS native implementation using LocalAuthentication framework
- Secure session management with configurable duration
- Credential storage with encryption support
- TypeScript definitions with full type safety
- Support for multiple biometric types:
  - Fingerprint (Android/iOS)
  - Face ID (iOS)
  - Face Authentication (Android)
  - Device credentials as fallback
- Comprehensive configuration options:
  - Session duration
  - UI customization
  - Fallback methods
  - Max attempts and lockout duration
- Session management utilities for web platform
- Example React application demonstrating all features
- Full documentation and contributing guidelines

### Security
- Implemented AES-GCM encryption for web platform credentials
- Android Keystore integration for secure credential storage
- iOS Keychain integration for secure credential storage
- Session tokens with configurable expiration

## [0.0.1] - 2024-01-XX (Upcoming)

### Notes
- Initial beta release
- Requires Capacitor 7.x
- Minimum Android API 23 (Android 6.0)
- Minimum iOS 13.0
- Supports latest web browsers with WebAuthn support
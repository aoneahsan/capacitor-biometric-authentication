# Configuration Reference

**Last Updated:** 2025-12-02

## Plugin Configuration

### BiometricAuthConfig

Configure via `BiometricAuth.configure(config)`:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| sessionDuration | number | 3600 | Session validity in seconds |
| encryptionSecret | string | - | Secret for data encryption (min 32 chars recommended) |
| requireAuthenticationForEveryAccess | boolean | false | Require auth for every operation |
| uiConfig | BiometricUIConfig | - | UI customization |
| fallbackMethods | FallbackMethod[] | [] | Allowed fallback methods |

### UI Configuration

```typescript
interface BiometricUIConfig {
  primaryColor?: string;      // Hex color for primary elements
  backgroundColor?: string;   // Hex color for background
  textColor?: string;         // Hex color for text
  logo?: string;              // URL or base64 logo image
}
```

### Fallback Methods

```typescript
enum FallbackMethod {
  PASSCODE = 'passcode',
  PASSWORD = 'password',
  PATTERN = 'pattern',
  PIN = 'pin',
  SECURITY_QUESTION = 'securityQuestion'
}
```

---

## Authentication Options

### Common Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| title | string | "Authentication Required" | Prompt title |
| subtitle | string | - | Subtitle (Android only) |
| description | string | - | Description text |
| fallbackButtonTitle | string | "Use Passcode" | Fallback button text |
| cancelButtonTitle | string | "Cancel" | Cancel button text |
| disableFallback | boolean | false | Disable passcode fallback |
| maxAttempts | number | 3 | Maximum failed attempts |
| saveCredentials | boolean | false | Save credentials for future (Web) |

---

## WebAuthn Options

### Create Options (Registration)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| challenge | ArrayBuffer/Uint8Array/string | auto-generated | Server challenge |
| rp.id | string | window.location.hostname | Relying party ID |
| rp.name | string | "Biometric Authentication" | Relying party name |
| user.id | ArrayBuffer/Uint8Array/string | auto-generated | User identifier |
| user.name | string | "user" | Username |
| user.displayName | string | "User" | Display name |
| pubKeyCredParams | array | ES256, RS256 | Supported algorithms |
| authenticatorSelection.authenticatorAttachment | string | "platform" | "platform" or "cross-platform" |
| authenticatorSelection.requireResidentKey | boolean | false | Require resident key |
| authenticatorSelection.residentKey | string | "preferred" | "discouraged", "preferred", "required" |
| authenticatorSelection.userVerification | string | "required" | "discouraged", "preferred", "required" |
| timeout | number | 60000 | Timeout in milliseconds |
| attestation | string | "none" | "none", "indirect", "direct", "enterprise" |
| excludeCredentials | array | - | Credentials to exclude |
| extensions | object | - | WebAuthn extensions |
| hints | array | - | UI hints |

### Get Options (Authentication)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| challenge | ArrayBuffer/Uint8Array/string | auto-generated | Server challenge |
| rpId | string | window.location.hostname | Relying party ID |
| allowCredentials | array | stored credentials | Allowed credentials |
| userVerification | string | "required" | User verification requirement |
| timeout | number | 60000 | Timeout in milliseconds |
| extensions | object | - | WebAuthn extensions |
| hints | array | - | UI hints |

### Default Public Key Parameters

```typescript
[
  { alg: -7, type: 'public-key' },   // ES256 (ECDSA with P-256 and SHA-256)
  { alg: -257, type: 'public-key' }  // RS256 (RSASSA-PKCS1-v1_5 with SHA-256)
]
```

---

## Android Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| challenge | string/ArrayBuffer | - | Challenge for crypto operations |
| cryptoType | string | - | "signature", "cipher", or "mac" |
| authenticationValidityDuration | number | -1 | Key validity after auth (seconds), -1 = every time |
| invalidateOnEnrollment | boolean | true | Invalidate key on new biometric enrollment |
| requireStrongBiometric | boolean | false | Require Class 3 (strong) biometric |
| keyAlias | string | auto-generated | Keystore key alias |
| signatureAlgorithm | string | "SHA256withECDSA" | Signature algorithm |
| keySize | number | 256 (EC), 2048 (RSA) | Key size in bits |

### Signature Algorithms

| Algorithm | Description |
|-----------|-------------|
| SHA256withRSA | RSA signature with SHA-256 |
| SHA256withECDSA | ECDSA signature with SHA-256 |
| SHA512withRSA | RSA signature with SHA-512 |
| SHA512withECDSA | ECDSA signature with SHA-512 |

### Crypto Types

| Type | Use Case | Output |
|------|----------|--------|
| signature | Data signing, verification | signedChallenge, publicKey |
| cipher | Data encryption/decryption | encryptedData, iv |
| mac | Message authentication | macResult |

---

## iOS Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| localizedReason | string | title | Reason shown to user |
| localizedCancelTitle | string | "Cancel" | Cancel button text |
| localizedFallbackTitle | string | "Use Passcode" | Fallback button text |
| evaluatePolicy | string | "deviceOwnerAuthentication" | LAPolicy to use |

### Policies

| Policy | Description |
|--------|-------------|
| deviceOwnerAuthenticationWithBiometrics | Biometric only |
| deviceOwnerAuthentication | Biometric with passcode fallback |

---

## Default Values Summary

### Session Defaults

| Platform | Session Duration | Storage |
|----------|-----------------|---------|
| Web | 3600s (1 hour) | sessionStorage + memory |
| iOS | 3600s (1 hour) | UserDefaults |
| Android | 3600s (1 hour) | SharedPreferences |

### Security Defaults

| Setting | Default | Recommendation |
|---------|---------|----------------|
| encryptionSecret | none | Set 32+ character secret |
| userVerification | "required" | Keep as "required" |
| attestation | "none" | Use "direct" for high security |
| invalidateOnEnrollment | true | Keep enabled |

### UI Defaults

| Platform | Title | Subtitle | Description |
|----------|-------|----------|-------------|
| Web | "Authentication Required" | - | - |
| iOS | "Authentication Required" | - | - |
| Android | "Authentication Required" | - | "Confirm your identity" |

---

## Configuration Examples

### Basic Setup

```typescript
BiometricAuth.configure({
  sessionDuration: 1800,  // 30 minutes
});
```

### High Security

```typescript
BiometricAuth.configure({
  sessionDuration: 300,  // 5 minutes
  encryptionSecret: 'your-32-character-minimum-secret-key',
  requireAuthenticationForEveryAccess: true,
});
```

### With Android Crypto

```typescript
await BiometricAuth.authenticate({
  title: 'Sign Transaction',
  androidOptions: {
    challenge: 'transaction-data-to-sign',
    cryptoType: 'signature',
    signatureAlgorithm: 'SHA256withECDSA',
    requireStrongBiometric: true,
    invalidateOnEnrollment: true,
  }
});
```

### WebAuthn Server Integration

```typescript
await BiometricAuth.authenticate({
  webAuthnOptions: {
    get: {
      challenge: serverChallenge,  // From your server
      rpId: 'your-domain.com',
      userVerification: 'required',
      timeout: 120000,
    }
  }
});
```

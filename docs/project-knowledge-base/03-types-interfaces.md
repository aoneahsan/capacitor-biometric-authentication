# Types & Interfaces

**Last Updated:** 2025-12-02

## Enums

### BiometricType

```typescript
enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACE_ID = 'faceId',
  TOUCH_ID = 'touchId',
  IRIS = 'iris',
  FACE_AUTHENTICATION = 'faceAuthentication',
  PASSCODE = 'passcode',
  PATTERN = 'pattern',
  PIN = 'pin'
}
```

### BiometricErrorCode

```typescript
enum BiometricErrorCode {
  AUTHENTICATION_FAILED = 'authenticationFailed',
  USER_CANCELLED = 'userCancelled',
  SYSTEM_CANCELLED = 'systemCancelled',
  NOT_AVAILABLE = 'notAvailable',
  PERMISSION_DENIED = 'permissionDenied',
  LOCKED_OUT = 'lockedOut',
  INVALID_CONTEXT = 'invalidContext',
  NOT_ENROLLED = 'notEnrolled',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}
```

### BiometricUnavailableReason

```typescript
enum BiometricUnavailableReason {
  NO_HARDWARE = 'noHardware',
  HARDWARE_UNAVAILABLE = 'hardwareUnavailable',
  NO_ENROLLED_BIOMETRICS = 'noEnrolledBiometrics',
  PERMISSION_DENIED = 'permissionDenied',
  NOT_SUPPORTED = 'notSupported',
  LOCKED_OUT = 'lockedOut',
  USER_DISABLED = 'userDisabled'
}
```

### FallbackMethod

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

## Core Interfaces

### BiometricAuthPlugin

```typescript
interface BiometricAuthPlugin {
  isAvailable(): Promise<BiometricAvailabilityResult>;
  getSupportedBiometrics(): Promise<SupportedBiometricsResult>;
  authenticate(options?: BiometricAuthOptions): Promise<BiometricAuthResult>;
  register?(options?: BiometricAuthOptions): Promise<BiometricAuthResult>;
  deleteCredentials(): Promise<void>;
  configure(config: BiometricAuthConfig): Promise<void>;
}
```

### BiometricAuthAdapter

```typescript
interface BiometricAuthAdapter {
  platform: string;
  isAvailable(): Promise<boolean>;
  getSupportedBiometrics(): Promise<BiometryType[]>;
  authenticate(options?: BiometricAuthOptions): Promise<BiometricAuthResult>;
  deleteCredentials(): Promise<void>;
  hasCredentials(): Promise<boolean>;
}
```

---

## Options Interfaces

### BiometricAuthOptions

```typescript
interface BiometricAuthOptions {
  title?: string;
  subtitle?: string;
  description?: string;
  fallbackButtonTitle?: string;
  cancelButtonTitle?: string;
  disableFallback?: boolean;
  maxAttempts?: number;
  saveCredentials?: boolean;
  webAuthnOptions?: WebAuthnOptions;
  androidOptions?: AndroidBiometricOptions;
}
```

### WebAuthnOptions

```typescript
interface WebAuthnOptions {
  create?: WebAuthnCreateOptions;
  get?: WebAuthnGetOptions;
}
```

### WebAuthnCreateOptions

```typescript
interface WebAuthnCreateOptions {
  challenge?: ArrayBuffer | Uint8Array | string;
  rp?: {
    id?: string;
    name?: string;
  };
  user?: {
    id?: ArrayBuffer | Uint8Array | string;
    name?: string;
    displayName?: string;
  };
  pubKeyCredParams?: Array<{
    alg: number;
    type: 'public-key';
  }>;
  authenticatorSelection?: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    requireResidentKey?: boolean;
    residentKey?: 'discouraged' | 'preferred' | 'required';
    userVerification?: 'discouraged' | 'preferred' | 'required';
  };
  timeout?: number;
  attestation?: 'none' | 'indirect' | 'direct' | 'enterprise';
  attestationFormats?: string[];
  excludeCredentials?: Array<{
    id: ArrayBuffer | Uint8Array | string;
    type: 'public-key';
    transports?: Array<'ble' | 'hybrid' | 'internal' | 'nfc' | 'usb'>;
  }>;
  extensions?: Record<string, unknown>;
  hints?: Array<'security-key' | 'client-device' | 'hybrid'>;
}
```

### WebAuthnGetOptions

```typescript
interface WebAuthnGetOptions {
  challenge?: ArrayBuffer | Uint8Array | string;
  rpId?: string;
  allowCredentials?: Array<{
    id: ArrayBuffer | Uint8Array | string;
    type: 'public-key';
    transports?: Array<'ble' | 'hybrid' | 'internal' | 'nfc' | 'usb'>;
  }>;
  userVerification?: 'discouraged' | 'preferred' | 'required';
  timeout?: number;
  extensions?: Record<string, unknown>;
  hints?: Array<'security-key' | 'client-device' | 'hybrid'>;
  storedCredentialId?: string;
  storedCredentialRawId?: string;
  storedUserId?: string;
}
```

### AndroidBiometricOptions

```typescript
interface AndroidBiometricOptions {
  challenge?: string | ArrayBuffer;
  cryptoType?: 'signature' | 'cipher' | 'mac';
  authenticationValidityDuration?: number;
  invalidateOnEnrollment?: boolean;
  requireStrongBiometric?: boolean;
  keyAlias?: string;
  signatureAlgorithm?: 'SHA256withRSA' | 'SHA256withECDSA' | 'SHA512withRSA' | 'SHA512withECDSA';
  keySize?: number;
}
```

---

## Result Interfaces

### BiometricAuthResult

```typescript
interface BiometricAuthResult {
  success: boolean;
  token?: string;
  sessionId?: string;
  error?: BiometricAuthError;
  androidCryptoResult?: AndroidCryptoResult;
}
```

### BiometricAuthError

```typescript
interface BiometricAuthError {
  code: BiometricErrorCode;
  message: string;
  details?: unknown;
}
```

### BiometricAvailabilityResult

```typescript
interface BiometricAvailabilityResult {
  available: boolean;
  reason?: BiometricUnavailableReason;
  errorMessage?: string;
}
```

### SupportedBiometricsResult

```typescript
interface SupportedBiometricsResult {
  biometrics: BiometricType[];
}
```

### AndroidCryptoResult

```typescript
interface AndroidCryptoResult {
  signedChallenge?: string;   // base64 encoded
  encryptedData?: string;     // base64 encoded
  iv?: string;                // base64 encoded
  publicKey?: string;         // base64 encoded
  macResult?: string;         // base64 encoded
  operationType: 'signature' | 'cipher' | 'mac';
  algorithm?: string;
}
```

---

## Configuration Interfaces

### BiometricAuthConfig

```typescript
interface BiometricAuthConfig {
  sessionDuration?: number;
  encryptionSecret?: string;
  requireAuthenticationForEveryAccess?: boolean;
  uiConfig?: BiometricUIConfig;
  fallbackMethods?: FallbackMethod[];
}
```

### BiometricAuthConfiguration

```typescript
interface BiometricAuthConfiguration {
  adapter?: 'auto' | string;
  customAdapters?: Record<string, BiometricAuthAdapter>;
  debug?: boolean;
  sessionDuration?: number;
  encryptionKey?: string;
}
```

### BiometricUIConfig

```typescript
interface BiometricUIConfig {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  logo?: string;
}
```

---

## State Interfaces

### BiometricAuthState

```typescript
interface BiometricAuthState {
  isAuthenticated: boolean;
  sessionId?: string;
  lastAuthTime?: number;
  biometryType?: BiometryType;
  error?: BiometricError;
}
```

### BiometricError

```typescript
interface BiometricError {
  code: string;
  message: string;
}
```

---

## Platform Detection

### PlatformInfo

```typescript
interface PlatformInfo {
  name: string;
  version?: string;
  isCapacitor: boolean;
  isReactNative: boolean;
  isCordova: boolean;
  isWeb: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isElectron: boolean;
}
```

---

## Session Management

### SessionData

```typescript
interface SessionData {
  token: string;
  expiresAt: number;
  credentialId?: string;
  biometryType?: BiometryType;
}
```

### CredentialData

```typescript
interface CredentialData {
  id: string;
  rawId: string;
  response: {
    authenticatorData?: string;
    clientDataJSON: string;
    signature?: string;
    userHandle?: string;
    attestationObject?: string;
    transports?: string[];
  };
  type: string;
  clientExtensionResults?: string;
  authenticatorAttachment?: string;
}
```

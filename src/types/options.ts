/**
 * Options for biometric authentication
 */
export interface BiometricAuthOptions {
  /** Title to display in the biometric prompt */
  title?: string;
  /** Subtitle to display in the biometric prompt */
  subtitle?: string;
  /** Description/reason to display in the biometric prompt */
  description?: string;
  /** Reason for authentication (alias for description) */
  reason?: string;
  /** Text for the fallback button */
  fallbackButtonTitle?: string;
  /** Alias for fallbackButtonTitle */
  fallbackTitle?: string;
  /** Text for the cancel button */
  cancelButtonTitle?: string;
  /** Alias for cancelButtonTitle */
  cancelTitle?: string;
  /** Whether to disable the fallback button */
  disableFallback?: boolean;
  /** Alias for disableFallback */
  disableDeviceCredential?: boolean;
  /** Maximum number of failed attempts before fallback */
  maxAttempts?: number;
  /** Session timeout in milliseconds */
  sessionTimeout?: number;
  /** Whether to require explicit confirmation after biometric */
  requireConfirmation?: boolean;
  /** Whether to save credentials for future use */
  saveCredentials?: boolean;
  /** WebAuthn specific options for web platform */
  webAuthnOptions?: WebAuthnOptions;
  /** Android specific options */
  androidOptions?: AndroidBiometricOptions;
  /** Platform-specific options (alternative structure) */
  platform?: {
    web?: WebAuthPlatformOptions;
    android?: AndroidAuthPlatformOptions;
    ios?: IOSAuthPlatformOptions;
  };
}

/**
 * WebAuthn options container
 */
export interface WebAuthnOptions {
  /** Options for credential creation (registration) */
  create?: WebAuthnCreateOptions;
  /** Options for credential request (authentication) */
  get?: WebAuthnGetOptions;
}

/**
 * WebAuthn credential creation options
 */
export interface WebAuthnCreateOptions {
  /** Challenge from the relying party's server */
  challenge?: ArrayBuffer | Uint8Array | string;
  /** Relying party information */
  rp?: {
    id?: string;
    name?: string;
  };
  /** User account information */
  user?: {
    id?: ArrayBuffer | Uint8Array | string;
    name?: string;
    displayName?: string;
  };
  /** List of supported public key credential parameters */
  pubKeyCredParams?: Array<{
    alg: number;
    type: 'public-key';
  }>;
  /** Authenticator selection criteria */
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  /** Timeout for the operation in milliseconds */
  timeout?: number;
  /** Attestation preference */
  attestation?: AttestationConveyancePreference;
  /** Attestation statement formats */
  attestationFormats?: string[];
  /** Credentials to exclude from creation */
  excludeCredentials?: PublicKeyCredentialDescriptor[];
  /** Extension inputs */
  extensions?: Record<string, unknown>;
  /** Hints for user agent UI */
  hints?: Array<'security-key' | 'client-device' | 'hybrid'>;
}

/**
 * WebAuthn credential request options
 */
export interface WebAuthnGetOptions {
  /** Challenge from the relying party's server */
  challenge?: ArrayBuffer | Uint8Array | string;
  /** Relying party identifier */
  rpId?: string;
  /** List of allowed credentials */
  allowCredentials?: PublicKeyCredentialDescriptor[];
  /** User verification requirement */
  userVerification?: UserVerificationRequirement;
  /** Timeout for the operation in milliseconds */
  timeout?: number;
  /** Extension inputs */
  extensions?: Record<string, unknown>;
  /** Hints for user agent UI */
  hints?: Array<'security-key' | 'client-device' | 'hybrid'>;
  /** Stored credential ID for mobile authentication */
  storedCredentialId?: string;
  /** Stored credential raw ID for mobile authentication */
  storedCredentialRawId?: string;
  /** Stored user ID for mobile authentication */
  storedUserId?: string;
}

/**
 * Public key credential descriptor
 */
export interface PublicKeyCredentialDescriptor {
  id: ArrayBuffer | Uint8Array | string;
  type: 'public-key';
  transports?: AuthenticatorTransport[];
}

/**
 * Authenticator selection criteria
 */
export interface AuthenticatorSelectionCriteria {
  authenticatorAttachment?: AuthenticatorAttachment;
  requireResidentKey?: boolean;
  residentKey?: ResidentKeyRequirement;
  userVerification?: UserVerificationRequirement;
}

/**
 * Authenticator attachment type
 */
export type AuthenticatorAttachment = 'platform' | 'cross-platform';

/**
 * Resident key requirement
 */
export type ResidentKeyRequirement = 'discouraged' | 'preferred' | 'required';

/**
 * User verification requirement
 */
export type UserVerificationRequirement = 'discouraged' | 'preferred' | 'required';

/**
 * Attestation conveyance preference
 */
export type AttestationConveyancePreference = 'none' | 'indirect' | 'direct' | 'enterprise';

/**
 * Authenticator transport
 */
export type AuthenticatorTransport = 'ble' | 'hybrid' | 'internal' | 'nfc' | 'usb';

/**
 * Android-specific biometric options
 */
export interface AndroidBiometricOptions {
  /** Challenge for cryptographic operations */
  challenge?: string | ArrayBuffer;
  /** Type of cryptographic operation to perform */
  cryptoType?: 'signature' | 'cipher' | 'mac';
  /** Key validity duration in seconds (-1 for auth required every time) */
  authenticationValidityDuration?: number;
  /** Whether the key should be invalidated on new biometric enrollment */
  invalidateOnEnrollment?: boolean;
  /** Require strong biometric (Class 3) */
  requireStrongBiometric?: boolean;
  /** Key alias to use for cryptographic operations */
  keyAlias?: string;
  /** Algorithm to use for signature operations */
  signatureAlgorithm?: 'SHA256withRSA' | 'SHA256withECDSA' | 'SHA512withRSA' | 'SHA512withECDSA';
  /** Key size for key generation */
  keySize?: number;
}

/**
 * Web platform options (alternative structure)
 */
export interface WebAuthPlatformOptions {
  rpId?: string;
  rpName?: string;
  challenge?: ArrayBuffer;
  userVerification?: UserVerificationRequirement;
  timeout?: number;
  attestation?: AttestationConveyancePreference;
  authenticatorSelection?: AuthenticatorSelectionCriteria;
}

/**
 * Android platform options (alternative structure)
 */
export interface AndroidAuthPlatformOptions {
  title?: string;
  subtitle?: string;
  description?: string;
  negativeButtonText?: string;
  confirmationRequired?: boolean;
  deviceCredentialAllowed?: boolean;
  strongBiometricOnly?: boolean;
}

/**
 * iOS platform options
 */
export interface IOSAuthPlatformOptions {
  localizedReason?: string;
  localizedCancelTitle?: string;
  localizedFallbackTitle?: string;
  biometryType?: 'touchId' | 'faceId';
  evaluatePolicy?: 'deviceOwnerAuthentication' | 'deviceOwnerAuthenticationWithBiometrics';
}

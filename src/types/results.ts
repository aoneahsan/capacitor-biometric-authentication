import type { BiometricError } from './errors';

/**
 * Types of biometric authentication available
 */
export enum BiometryType {
  /** Fingerprint scanner */
  FINGERPRINT = 'fingerprint',
  /** Apple Face ID */
  FACE_ID = 'faceId',
  /** Apple Touch ID */
  TOUCH_ID = 'touchId',
  /** Iris scanner */
  IRIS = 'iris',
  /** Generic face authentication (Android) */
  FACE_AUTHENTICATION = 'faceAuthentication',
  /** Multiple biometric types available */
  MULTIPLE = 'multiple',
  /** Passcode/PIN fallback */
  PASSCODE = 'passcode',
  /** Pattern lock (Android) */
  PATTERN = 'pattern',
  /** PIN code */
  PIN = 'pin',
  /** Unknown biometric type */
  UNKNOWN = 'unknown',
}

/**
 * Result of biometric authentication
 */
export interface BiometricAuthResult {
  /** Whether authentication was successful */
  success: boolean;
  /** Authentication token if successful */
  token?: string;
  /** Session ID for the authenticated session */
  sessionId?: string;
  /** Error that occurred during authentication */
  error?: BiometricError;
  /** Type of biometry used */
  biometryType?: BiometryType;
  /** Platform that handled the authentication */
  platform?: string;
  /** Android-specific cryptographic results */
  androidCryptoResult?: AndroidCryptoResult;
}

/**
 * Result of checking biometric availability
 */
export interface BiometricAvailabilityResult {
  /** Whether biometric authentication is available */
  available: boolean;
  /** Reason why biometric is not available */
  reason?: string;
  /** Error message with more details */
  errorMessage?: string;
}

/**
 * Result of getting supported biometrics
 */
export interface SupportedBiometricsResult {
  /** List of supported biometric types */
  biometrics: BiometryType[];
}

/**
 * Android-specific cryptographic operation result
 */
export interface AndroidCryptoResult {
  /** Signed challenge (base64 encoded) for signature operations */
  signedChallenge?: string;
  /** Encrypted data (base64 encoded) for cipher operations */
  encryptedData?: string;
  /** Initialization vector (base64 encoded) for cipher operations */
  iv?: string;
  /** Public key (base64 encoded) for signature verification */
  publicKey?: string;
  /** MAC result (base64 encoded) for MAC operations */
  macResult?: string;
  /** Type of cryptographic operation performed */
  operationType: 'signature' | 'cipher' | 'mac';
  /** Algorithm used for the operation */
  algorithm?: string;
}

/**
 * Current authentication state
 */
export interface BiometricAuthState {
  /** Whether user is currently authenticated */
  isAuthenticated: boolean;
  /** Current session ID */
  sessionId?: string;
  /** Timestamp of last successful authentication */
  lastAuthTime?: number;
  /** Type of biometry used for authentication */
  biometryType?: BiometryType;
  /** Last error that occurred */
  error?: BiometricError;
}

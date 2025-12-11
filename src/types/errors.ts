/**
 * Unified error codes for biometric authentication
 * Using UPPER_CASE convention for enum values (more conventional)
 */
export enum BiometricErrorCode {
  /** Authentication attempt failed */
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  /** User cancelled the authentication */
  USER_CANCELLED = 'USER_CANCELLED',
  /** System cancelled the authentication */
  SYSTEM_CANCELLED = 'SYSTEM_CANCELLED',
  /** Biometric hardware not available */
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  /** Biometric hardware unavailable (legacy alias) */
  BIOMETRIC_UNAVAILABLE = 'BIOMETRIC_UNAVAILABLE',
  /** Permission denied by user */
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  /** User is locked out due to too many failed attempts */
  LOCKED_OUT = 'LOCKED_OUT',
  /** Lockout (legacy alias) */
  LOCKOUT = 'LOCKOUT',
  /** Invalid context for authentication */
  INVALID_CONTEXT = 'INVALID_CONTEXT',
  /** No biometrics enrolled on device */
  NOT_ENROLLED = 'NOT_ENROLLED',
  /** Authentication timed out */
  TIMEOUT = 'TIMEOUT',
  /** Platform not supported */
  PLATFORM_NOT_SUPPORTED = 'PLATFORM_NOT_SUPPORTED',
  /** Unknown error occurred */
  UNKNOWN = 'UNKNOWN',
  /** Unknown error (legacy alias) */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Biometric error interface
 */
export interface BiometricError {
  /** Error code */
  code: BiometricErrorCode;
  /** Human-readable error message */
  message: string;
  /** Additional error details */
  details?: unknown;
}

/**
 * Reasons why biometric authentication is unavailable
 */
export enum BiometricUnavailableReason {
  /** Device doesn't have biometric hardware */
  NO_HARDWARE = 'noHardware',
  /** Biometric hardware is unavailable */
  HARDWARE_UNAVAILABLE = 'hardwareUnavailable',
  /** No biometrics enrolled on device */
  NO_ENROLLED_BIOMETRICS = 'noEnrolledBiometrics',
  /** User denied permission */
  PERMISSION_DENIED = 'permissionDenied',
  /** Biometric not supported on this platform */
  NOT_SUPPORTED = 'notSupported',
  /** User locked out due to failed attempts */
  LOCKED_OUT = 'lockedOut',
  /** User disabled biometrics */
  USER_DISABLED = 'userDisabled',
}

/**
 * Map legacy camelCase error codes to UPPER_CASE
 * Used for backward compatibility
 */
export const errorCodeMapping: Record<string, BiometricErrorCode> = {
  authenticationFailed: BiometricErrorCode.AUTHENTICATION_FAILED,
  userCancelled: BiometricErrorCode.USER_CANCELLED,
  systemCancelled: BiometricErrorCode.SYSTEM_CANCELLED,
  notAvailable: BiometricErrorCode.NOT_AVAILABLE,
  permissionDenied: BiometricErrorCode.PERMISSION_DENIED,
  lockedOut: BiometricErrorCode.LOCKED_OUT,
  invalidContext: BiometricErrorCode.INVALID_CONTEXT,
  notEnrolled: BiometricErrorCode.NOT_ENROLLED,
  timeout: BiometricErrorCode.TIMEOUT,
  unknown: BiometricErrorCode.UNKNOWN,
};

/**
 * Normalize error code to UPPER_CASE format
 */
export function normalizeErrorCode(code: string): BiometricErrorCode {
  // Already in correct format
  if (Object.values(BiometricErrorCode).includes(code as BiometricErrorCode)) {
    return code as BiometricErrorCode;
  }
  // Map legacy format
  if (code in errorCodeMapping) {
    return errorCodeMapping[code];
  }
  return BiometricErrorCode.UNKNOWN;
}

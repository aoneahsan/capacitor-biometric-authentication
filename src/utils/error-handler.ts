/**
 * Unified error handling utilities for biometric authentication
 *
 * This module consolidates error mapping logic from multiple adapters
 * to provide consistent error handling across platforms.
 */

import {
  BiometricError,
  BiometricErrorCode,
  BiometricAuthResult,
} from '../types';

/**
 * Map a WebAuthn DOMException to a BiometricError
 */
export function mapDOMException(error: DOMException): BiometricError {
  switch (error.name) {
    case 'NotAllowedError':
      return {
        code: BiometricErrorCode.USER_CANCELLED,
        message: 'User cancelled the authentication',
        details: error,
      };

    case 'AbortError':
      return {
        code: BiometricErrorCode.USER_CANCELLED,
        message: 'Authentication was aborted',
        details: error,
      };

    case 'SecurityError':
      return {
        code: BiometricErrorCode.AUTHENTICATION_FAILED,
        message: 'Security error during authentication',
        details: error,
      };

    case 'InvalidStateError':
      return {
        code: BiometricErrorCode.AUTHENTICATION_FAILED,
        message: 'Invalid state for authentication',
        details: error,
      };

    case 'NotSupportedError':
      return {
        code: BiometricErrorCode.BIOMETRIC_UNAVAILABLE,
        message: 'WebAuthn is not supported',
        details: error,
      };

    case 'TimeoutError':
      return {
        code: BiometricErrorCode.TIMEOUT,
        message: 'Authentication timed out',
        details: error,
      };

    case 'ConstraintError':
      return {
        code: BiometricErrorCode.AUTHENTICATION_FAILED,
        message: 'Authenticator constraint not satisfied',
        details: error,
      };

    default:
      return {
        code: BiometricErrorCode.UNKNOWN_ERROR,
        message: error.message || 'An unknown DOM error occurred',
        details: error,
      };
  }
}

/**
 * Map a generic Error to a BiometricError
 */
export function mapGenericError(error: Error): BiometricError {
  const message = error.message.toLowerCase();

  // Check for common error patterns
  if (message.includes('cancelled') || message.includes('canceled')) {
    return {
      code: BiometricErrorCode.USER_CANCELLED,
      message: 'User cancelled the operation',
      details: error,
    };
  }

  if (message.includes('timeout') || message.includes('timed out')) {
    return {
      code: BiometricErrorCode.TIMEOUT,
      message: 'Operation timed out',
      details: error,
    };
  }

  if (message.includes('not available') || message.includes('unavailable')) {
    return {
      code: BiometricErrorCode.BIOMETRIC_UNAVAILABLE,
      message: 'Biometric authentication is not available',
      details: error,
    };
  }

  if (message.includes('not supported')) {
    return {
      code: BiometricErrorCode.PLATFORM_NOT_SUPPORTED,
      message: 'Operation is not supported on this platform',
      details: error,
    };
  }

  if (message.includes('not enrolled') || message.includes('no biometrics')) {
    return {
      code: BiometricErrorCode.NOT_ENROLLED,
      message: 'No biometrics enrolled on this device',
      details: error,
    };
  }

  if (message.includes('locked out') || message.includes('lockout')) {
    return {
      code: BiometricErrorCode.LOCKED_OUT,
      message: 'Biometric authentication is locked out due to too many attempts',
      details: error,
    };
  }

  return {
    code: BiometricErrorCode.UNKNOWN_ERROR,
    message: error.message || 'An unknown error occurred',
    details: error,
  };
}

/**
 * Map any unknown error to a BiometricError
 */
export function mapWebAuthnError(error: unknown): BiometricError {
  if (error instanceof DOMException) {
    return mapDOMException(error);
  }

  if (error instanceof Error) {
    return mapGenericError(error);
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      code: BiometricErrorCode.UNKNOWN_ERROR,
      message: error,
      details: error,
    };
  }

  // Handle completely unknown errors
  return {
    code: BiometricErrorCode.UNKNOWN_ERROR,
    message: 'An unknown error occurred',
    details: error,
  };
}

/**
 * Map a native platform error (iOS/Android/Windows) to a BiometricError
 */
export function mapNativeError(error: Error, platform: string): BiometricError {
  const message = error.message.toLowerCase();

  // Windows/Electron specific error messages
  if (platform === 'windows' || platform === 'electron') {
    // Windows Hello cancellation
    if (message.includes('cancelled') || message.includes('canceled') || message.includes('user refused')) {
      return {
        code: BiometricErrorCode.USER_CANCELLED,
        message: 'User cancelled Windows Hello authentication',
        details: error,
      };
    }

    // Windows Hello not configured
    if (message.includes('not configured') || message.includes('not set up')) {
      return {
        code: BiometricErrorCode.NOT_ENROLLED,
        message: 'Windows Hello is not configured',
        details: error,
      };
    }

    // Windows Hello not available
    if (message.includes('not available') || message.includes('not supported')) {
      return {
        code: BiometricErrorCode.NOT_AVAILABLE,
        message: 'Windows Hello is not available on this device',
        details: error,
      };
    }

    // Windows Hello lockout
    if (message.includes('locked') || message.includes('too many attempts')) {
      return {
        code: BiometricErrorCode.LOCKED_OUT,
        message: 'Windows Hello is locked due to too many attempts',
        details: error,
      };
    }
  }

  // iOS specific error messages
  if (platform === 'ios') {
    if (message.includes('user cancel') || message.includes('userCancel')) {
      return {
        code: BiometricErrorCode.USER_CANCELLED,
        message: 'User cancelled authentication',
        details: error,
      };
    }

    if (message.includes('passcode not set') || message.includes('passcodeNotSet')) {
      return {
        code: BiometricErrorCode.NOT_ENROLLED,
        message: 'Passcode is not set on this device',
        details: error,
      };
    }

    if (message.includes('biometry not available') || message.includes('biometryNotAvailable')) {
      return {
        code: BiometricErrorCode.NOT_AVAILABLE,
        message: 'Biometry is not available on this device',
        details: error,
      };
    }

    if (message.includes('biometry not enrolled') || message.includes('biometryNotEnrolled')) {
      return {
        code: BiometricErrorCode.NOT_ENROLLED,
        message: 'No biometrics are enrolled on this device',
        details: error,
      };
    }

    if (message.includes('biometry lockout') || message.includes('biometryLockout')) {
      return {
        code: BiometricErrorCode.LOCKED_OUT,
        message: 'Biometric authentication is locked out',
        details: error,
      };
    }
  }

  // Android specific error messages
  if (platform === 'android') {
    if (message.includes('ERROR_USER_CANCELED') || message.includes('user canceled')) {
      return {
        code: BiometricErrorCode.USER_CANCELLED,
        message: 'User cancelled authentication',
        details: error,
      };
    }

    if (message.includes('ERROR_NO_BIOMETRICS') || message.includes('no biometrics')) {
      return {
        code: BiometricErrorCode.NOT_ENROLLED,
        message: 'No biometrics are enrolled on this device',
        details: error,
      };
    }

    if (message.includes('ERROR_HW_NOT_PRESENT') || message.includes('hw not present')) {
      return {
        code: BiometricErrorCode.NOT_AVAILABLE,
        message: 'Biometric hardware is not available',
        details: error,
      };
    }

    if (message.includes('ERROR_HW_UNAVAILABLE') || message.includes('hw unavailable')) {
      return {
        code: BiometricErrorCode.NOT_AVAILABLE,
        message: 'Biometric hardware is currently unavailable',
        details: error,
      };
    }

    if (message.includes('ERROR_LOCKOUT') || message.includes('lockout')) {
      return {
        code: BiometricErrorCode.LOCKED_OUT,
        message: 'Biometric authentication is locked out',
        details: error,
      };
    }

    if (message.includes('ERROR_NEGATIVE_BUTTON') || message.includes('negative button')) {
      return {
        code: BiometricErrorCode.USER_CANCELLED,
        message: 'User pressed the negative button',
        details: error,
      };
    }
  }

  // Fall back to generic error mapping
  return mapGenericError(error);
}

/**
 * Create a failed BiometricAuthResult from an error
 */
export function createErrorResult(error: unknown, platform?: string): BiometricAuthResult {
  let biometricError: BiometricError;

  if (platform && error instanceof Error) {
    biometricError = mapNativeError(error, platform);
  } else {
    biometricError = mapWebAuthnError(error);
  }

  return {
    success: false,
    error: biometricError,
  };
}

/**
 * Check if an error is a user cancellation
 */
export function isUserCancellation(error: unknown): boolean {
  if (error instanceof DOMException) {
    return error.name === 'NotAllowedError' || error.name === 'AbortError';
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('cancel') || message.includes('abort');
  }

  return false;
}

/**
 * Check if an error is a timeout
 */
export function isTimeout(error: unknown): boolean {
  if (error instanceof DOMException) {
    return error.name === 'TimeoutError';
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('timeout') || message.includes('timed out');
  }

  return false;
}

/**
 * Check if an error indicates biometrics are unavailable
 */
export function isBiometricUnavailable(error: unknown): boolean {
  if (error instanceof DOMException) {
    return error.name === 'NotSupportedError';
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('not available') ||
      message.includes('unavailable') ||
      message.includes('not supported')
    );
  }

  return false;
}

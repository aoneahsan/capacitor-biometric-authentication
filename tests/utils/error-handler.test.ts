import { describe, it, expect } from 'vitest';
import {
  mapDOMException,
  mapGenericError,
  mapWebAuthnError,
  mapNativeError,
  createErrorResult,
  isUserCancellation,
  isTimeout,
  isBiometricUnavailable,
} from '../../src/utils/error-handler';
import { BiometricErrorCode } from '../../src/types';

describe('Error Handler Utilities', () => {
  describe('mapDOMException', () => {
    it('should map NotAllowedError to USER_CANCELLED', () => {
      const error = new DOMException('User cancelled', 'NotAllowedError');
      const result = mapDOMException(error);
      expect(result.code).toBe(BiometricErrorCode.USER_CANCELLED);
    });

    it('should map AbortError to USER_CANCELLED', () => {
      const error = new DOMException('Aborted', 'AbortError');
      const result = mapDOMException(error);
      expect(result.code).toBe(BiometricErrorCode.USER_CANCELLED);
    });

    it('should map SecurityError to AUTHENTICATION_FAILED', () => {
      const error = new DOMException('Security error', 'SecurityError');
      const result = mapDOMException(error);
      expect(result.code).toBe(BiometricErrorCode.AUTHENTICATION_FAILED);
    });

    it('should map InvalidStateError to AUTHENTICATION_FAILED', () => {
      const error = new DOMException('Invalid state', 'InvalidStateError');
      const result = mapDOMException(error);
      expect(result.code).toBe(BiometricErrorCode.AUTHENTICATION_FAILED);
    });

    it('should map NotSupportedError to BIOMETRIC_UNAVAILABLE', () => {
      const error = new DOMException('Not supported', 'NotSupportedError');
      const result = mapDOMException(error);
      expect(result.code).toBe(BiometricErrorCode.BIOMETRIC_UNAVAILABLE);
    });

    it('should map TimeoutError to TIMEOUT', () => {
      const error = new DOMException('Timed out', 'TimeoutError');
      const result = mapDOMException(error);
      expect(result.code).toBe(BiometricErrorCode.TIMEOUT);
    });

    it('should map unknown DOMException to UNKNOWN_ERROR', () => {
      const error = new DOMException('Unknown', 'SomeOtherError');
      const result = mapDOMException(error);
      expect(result.code).toBe(BiometricErrorCode.UNKNOWN_ERROR);
    });

    it('should include error details', () => {
      const error = new DOMException('Test message', 'NotAllowedError');
      const result = mapDOMException(error);
      expect(result.details).toBe(error);
    });
  });

  describe('mapGenericError', () => {
    it('should detect cancellation from message', () => {
      const error = new Error('User cancelled the operation');
      const result = mapGenericError(error);
      expect(result.code).toBe(BiometricErrorCode.USER_CANCELLED);
    });

    it('should detect timeout from message', () => {
      const error = new Error('Operation timed out');
      const result = mapGenericError(error);
      expect(result.code).toBe(BiometricErrorCode.TIMEOUT);
    });

    it('should detect unavailable from message', () => {
      const error = new Error('Biometrics not available');
      const result = mapGenericError(error);
      expect(result.code).toBe(BiometricErrorCode.BIOMETRIC_UNAVAILABLE);
    });

    it('should detect not supported from message', () => {
      const error = new Error('Feature not supported');
      const result = mapGenericError(error);
      expect(result.code).toBe(BiometricErrorCode.PLATFORM_NOT_SUPPORTED);
    });

    it('should detect not enrolled from message', () => {
      const error = new Error('No biometrics enrolled');
      const result = mapGenericError(error);
      expect(result.code).toBe(BiometricErrorCode.NOT_ENROLLED);
    });

    it('should detect lockout from message', () => {
      const error = new Error('Biometric lockout');
      const result = mapGenericError(error);
      expect(result.code).toBe(BiometricErrorCode.LOCKED_OUT);
    });

    it('should return UNKNOWN_ERROR for unrecognized errors', () => {
      const error = new Error('Some random error');
      const result = mapGenericError(error);
      expect(result.code).toBe(BiometricErrorCode.UNKNOWN_ERROR);
    });
  });

  describe('mapWebAuthnError', () => {
    it('should handle DOMException', () => {
      const error = new DOMException('Not allowed', 'NotAllowedError');
      const result = mapWebAuthnError(error);
      expect(result.code).toBe(BiometricErrorCode.USER_CANCELLED);
    });

    it('should handle regular Error', () => {
      const error = new Error('User cancelled');
      const result = mapWebAuthnError(error);
      expect(result.code).toBe(BiometricErrorCode.USER_CANCELLED);
    });

    it('should handle string error', () => {
      const error = 'Something went wrong';
      const result = mapWebAuthnError(error);
      expect(result.code).toBe(BiometricErrorCode.UNKNOWN_ERROR);
      expect(result.message).toBe('Something went wrong');
    });

    it('should handle unknown error types', () => {
      const result = mapWebAuthnError({ foo: 'bar' });
      expect(result.code).toBe(BiometricErrorCode.UNKNOWN_ERROR);
    });

    it('should handle null', () => {
      const result = mapWebAuthnError(null);
      expect(result.code).toBe(BiometricErrorCode.UNKNOWN_ERROR);
    });
  });

  describe('mapNativeError', () => {
    describe('iOS errors', () => {
      it('should map user cancel', () => {
        // The implementation checks for 'user cancel' (with space) after lowercasing
        const error = new Error('User Cancel');
        const result = mapNativeError(error, 'ios');
        expect(result.code).toBe(BiometricErrorCode.USER_CANCELLED);
      });

      it('should map biometry not available', () => {
        // The implementation checks for 'biometry not available' (with spaces) after lowercasing
        const error = new Error('Biometry not available');
        const result = mapNativeError(error, 'ios');
        expect(result.code).toBe(BiometricErrorCode.NOT_AVAILABLE);
      });

      it('should map biometry not enrolled', () => {
        // The implementation checks for 'biometry not enrolled' (with spaces) after lowercasing
        const error = new Error('Biometry not enrolled');
        const result = mapNativeError(error, 'ios');
        expect(result.code).toBe(BiometricErrorCode.NOT_ENROLLED);
      });

      it('should map biometry lockout', () => {
        // The implementation checks for 'biometry lockout' (with space) after lowercasing
        const error = new Error('Biometry Lockout');
        const result = mapNativeError(error, 'ios');
        expect(result.code).toBe(BiometricErrorCode.LOCKED_OUT);
      });
    });

    describe('Android errors', () => {
      it('should map ERROR_USER_CANCELED', () => {
        // The implementation lowercases and checks for 'error_user_canceled'
        const error = new Error('ERROR_USER_CANCELED');
        const result = mapNativeError(error, 'android');
        expect(result.code).toBe(BiometricErrorCode.USER_CANCELLED);
      });

      it('should map no biometrics error', () => {
        // The implementation checks for 'no biometrics' pattern
        const error = new Error('no biometrics enrolled');
        const result = mapNativeError(error, 'android');
        expect(result.code).toBe(BiometricErrorCode.NOT_ENROLLED);
      });

      it('should map hw not present error', () => {
        // The implementation checks for 'hw not present' pattern
        const error = new Error('hw not present');
        const result = mapNativeError(error, 'android');
        expect(result.code).toBe(BiometricErrorCode.NOT_AVAILABLE);
      });

      it('should map ERROR_LOCKOUT', () => {
        // The implementation checks for 'lockout' pattern
        const error = new Error('ERROR_LOCKOUT');
        const result = mapNativeError(error, 'android');
        expect(result.code).toBe(BiometricErrorCode.LOCKED_OUT);
      });

      it('should map negative button error', () => {
        // The implementation checks for 'negative button' pattern
        const error = new Error('negative button pressed');
        const result = mapNativeError(error, 'android');
        expect(result.code).toBe(BiometricErrorCode.USER_CANCELLED);
      });
    });

    describe('Windows/Electron errors', () => {
      it('should map Windows Hello cancellation', () => {
        const error = new Error('User cancelled the operation');
        const result = mapNativeError(error, 'windows');
        expect(result.code).toBe(BiometricErrorCode.USER_CANCELLED);
      });

      it('should map Windows Hello not configured', () => {
        const error = new Error('Windows Hello is not configured');
        const result = mapNativeError(error, 'windows');
        expect(result.code).toBe(BiometricErrorCode.NOT_ENROLLED);
      });

      it('should map Windows Hello not available', () => {
        const error = new Error('Windows Hello is not available');
        const result = mapNativeError(error, 'windows');
        expect(result.code).toBe(BiometricErrorCode.NOT_AVAILABLE);
      });

      it('should map Windows Hello lockout', () => {
        const error = new Error('Too many attempts, locked out');
        const result = mapNativeError(error, 'windows');
        expect(result.code).toBe(BiometricErrorCode.LOCKED_OUT);
      });

      it('should also work with electron platform', () => {
        const error = new Error('User cancelled authentication');
        const result = mapNativeError(error, 'electron');
        expect(result.code).toBe(BiometricErrorCode.USER_CANCELLED);
      });
    });

    it('should fallback to generic error mapping for unknown platform', () => {
      const error = new Error('User cancelled');
      const result = mapNativeError(error, 'unknown');
      expect(result.code).toBe(BiometricErrorCode.USER_CANCELLED);
    });
  });

  describe('createErrorResult', () => {
    it('should create failed result from error', () => {
      const error = new DOMException('Not allowed', 'NotAllowedError');
      const result = createErrorResult(error);
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(BiometricErrorCode.USER_CANCELLED);
    });

    it('should use platform-specific mapping when platform is provided', () => {
      const error = new Error('ERROR_USER_CANCELED');
      const result = createErrorResult(error, 'android');
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(BiometricErrorCode.USER_CANCELLED);
    });
  });

  describe('isUserCancellation', () => {
    it('should return true for NotAllowedError', () => {
      const error = new DOMException('User cancelled', 'NotAllowedError');
      expect(isUserCancellation(error)).toBe(true);
    });

    it('should return true for AbortError', () => {
      const error = new DOMException('Aborted', 'AbortError');
      expect(isUserCancellation(error)).toBe(true);
    });

    it('should return true for error with cancel in message', () => {
      const error = new Error('User cancelled the operation');
      expect(isUserCancellation(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = new Error('Something else');
      expect(isUserCancellation(error)).toBe(false);
    });
  });

  describe('isTimeout', () => {
    it('should return true for TimeoutError', () => {
      const error = new DOMException('Timed out', 'TimeoutError');
      expect(isTimeout(error)).toBe(true);
    });

    it('should return true for error with timeout in message', () => {
      const error = new Error('Operation timed out');
      expect(isTimeout(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = new Error('Something else');
      expect(isTimeout(error)).toBe(false);
    });
  });

  describe('isBiometricUnavailable', () => {
    it('should return true for NotSupportedError', () => {
      const error = new DOMException('Not supported', 'NotSupportedError');
      expect(isBiometricUnavailable(error)).toBe(true);
    });

    it('should return true for error with unavailable in message', () => {
      const error = new Error('Biometrics unavailable');
      expect(isBiometricUnavailable(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = new Error('Something else');
      expect(isBiometricUnavailable(error)).toBe(false);
    });
  });
});

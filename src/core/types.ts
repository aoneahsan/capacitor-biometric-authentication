/**
 * Core types - Re-exported from canonical types location
 *
 * @deprecated Import directly from '../types' instead
 */

// Re-export all types from canonical location
export {
  // Error types
  BiometricErrorCode,
  BiometricError,
  normalizeErrorCode,

  // Result types
  BiometryType,
  BiometricAuthResult,
  BiometricAuthState,

  // Option types
  BiometricAuthOptions,

  // Adapter types
  BiometricAuthAdapter,
  BiometricAuthConfiguration,

  // Platform types
  PlatformInfo,
} from '../types';

// Re-export platform option types for backward compatibility
export type {
  WebAuthPlatformOptions as WebAuthOptions,
  AndroidAuthPlatformOptions as AndroidAuthOptions,
  IOSAuthPlatformOptions as IOSAuthOptions,
} from '../types';
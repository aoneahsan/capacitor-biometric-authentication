/**
 * Unified type definitions for capacitor-biometric-authentication
 *
 * This is the canonical source for all types. Other type files
 * (definitions.ts, core/types.ts) re-export from here for backward compatibility.
 */

// Error types
export {
  BiometricErrorCode,
  BiometricError,
  BiometricUnavailableReason,
  errorCodeMapping,
  normalizeErrorCode,
} from './errors';

// Result types
export {
  BiometryType,
  BiometricAuthResult,
  BiometricAvailabilityResult,
  SupportedBiometricsResult,
  AndroidCryptoResult,
  BiometricAuthState,
} from './results';

// Option types
export {
  BiometricAuthOptions,
  WebAuthnOptions,
  WebAuthnCreateOptions,
  WebAuthnGetOptions,
  PublicKeyCredentialDescriptor,
  AuthenticatorSelectionCriteria,
  AndroidBiometricOptions,
  WebAuthPlatformOptions,
  AndroidAuthPlatformOptions,
  IOSAuthPlatformOptions,
} from './options';
export type {
  AuthenticatorAttachment,
  ResidentKeyRequirement,
  UserVerificationRequirement,
  AttestationConveyancePreference,
  AuthenticatorTransport,
} from './options';

// Adapter types
export {
  BiometricAuthAdapter,
  FallbackMethod,
  BiometricAuthConfiguration,
  BiometricUIConfig,
} from './adapters';

// Platform types
export {
  PlatformInfo,
  PlatformCapabilities,
  getPlatformCapabilities,
} from './platform';
export type { SupportedPlatform } from './platform';

/**
 * Legacy type aliases for backward compatibility
 * @deprecated Use BiometricAuthConfiguration instead
 */
export type BiometricAuthConfig = import('./adapters').BiometricAuthConfiguration;

/**
 * Legacy type alias
 * @deprecated Use BiometryType instead
 */
export type BiometricType = import('./results').BiometryType;

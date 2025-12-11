import { BiometricAuthCore } from './core/BiometricAuthCore';
import type {
  BiometricAuthOptions,
  BiometricAuthResult,
  BiometricAuthConfiguration,
  BiometricAuthAdapter,
  BiometricAuthState,
  BiometryType,
  BiometricError
} from './core/types';

// Create singleton instance
const biometricAuth = BiometricAuthCore.getInstance();

// Export the main API (provider-less, like Zustand)
const BiometricAuth = {
  // Core methods
  configure: (config: Partial<BiometricAuthConfiguration>) => biometricAuth.configure(config),
  isAvailable: () => biometricAuth.isAvailable(),
  getSupportedBiometrics: () => biometricAuth.getSupportedBiometrics(),
  authenticate: (options?: BiometricAuthOptions) => biometricAuth.authenticate(options),
  deleteCredentials: () => biometricAuth.deleteCredentials(),
  hasCredentials: () => biometricAuth.hasCredentials(),
  
  // State management
  logout: () => biometricAuth.logout(),
  getState: () => biometricAuth.getState(),
  isAuthenticated: () => biometricAuth.isAuthenticated(),
  subscribe: (callback: (state: BiometricAuthState) => void) => biometricAuth.subscribe(callback),
  
  // Utility methods
  requireAuthentication: (callback: () => void | Promise<void>, options?: BiometricAuthOptions) => 
    biometricAuth.requireAuthentication(callback, options),
  withAuthentication: <T>(callback: () => T | Promise<T>, options?: BiometricAuthOptions) => 
    biometricAuth.withAuthentication(callback, options),
  
  // Advanced usage
  registerAdapter: (name: string, adapter: BiometricAuthAdapter) => 
    biometricAuth.registerAdapter(name, adapter),
};

// Export types
export type {
  BiometricAuthOptions,
  BiometricAuthResult,
  BiometricAuthConfiguration,
  BiometricAuthAdapter,
  BiometricAuthState,
  BiometryType,
  BiometricError
};

export { BiometricErrorCode } from './core/types';

// Export the main API as default
export default BiometricAuth;

// Also export named for flexibility
export { BiometricAuth };

// Export core classes for advanced usage
export { BiometricAuthCore } from './core/BiometricAuthCore';
export { PlatformDetector } from './core/platform-detector';

// Export adapters for those who want to use them directly
export { WebAdapter } from './adapters/WebAdapter';
export { CapacitorAdapter } from './adapters/CapacitorAdapter';

// NOTE: Web plugin registration has been REMOVED
//
// The BiometricAuth package now works as follows:
// - On NATIVE (Android/iOS): Uses Capacitor.Plugins.BiometricAuth which is auto-registered by native layer
// - On WEB: Uses WebAdapter which implements WebAuthn API directly
//
// DO NOT add registerPlugin() calls here - it causes ".then() is not implemented" errors
// on native platforms because it creates a conflicting proxy over the already-registered native plugin
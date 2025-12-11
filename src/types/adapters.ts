import type { BiometricAuthOptions } from './options';
import type { BiometricAuthResult, BiometryType } from './results';

/**
 * Interface for biometric authentication adapters
 * Each platform implements this interface
 */
export interface BiometricAuthAdapter {
  /** Platform identifier */
  platform: string;

  /**
   * Check if biometric authentication is available
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get list of supported biometric types
   */
  getSupportedBiometrics(): Promise<BiometryType[]>;

  /**
   * Perform biometric authentication
   */
  authenticate(options?: BiometricAuthOptions): Promise<BiometricAuthResult>;

  /**
   * Delete stored credentials
   */
  deleteCredentials(): Promise<void>;

  /**
   * Check if credentials exist for the current user
   */
  hasCredentials(): Promise<boolean>;
}

/**
 * Fallback authentication methods
 */
export enum FallbackMethod {
  PASSCODE = 'passcode',
  PASSWORD = 'password',
  PATTERN = 'pattern',
  PIN = 'pin',
  SECURITY_QUESTION = 'securityQuestion',
}

/**
 * Plugin configuration options
 */
export interface BiometricAuthConfiguration {
  /** Adapter selection mode */
  adapter?: 'auto' | string;
  /** Custom adapters to register */
  customAdapters?: Record<string, BiometricAuthAdapter>;
  /** Enable debug logging */
  debug?: boolean;
  /** Session validity duration in seconds (default: 3600) */
  sessionDuration?: number;
  /** Encryption key for secure storage */
  encryptionKey?: string;
  /** Secret key for encryption (alias for encryptionKey) */
  encryptionSecret?: string;
  /** Require auth for every sensitive operation */
  requireAuthenticationForEveryAccess?: boolean;
  /** UI customization */
  uiConfig?: BiometricUIConfig;
  /** Allowed fallback methods */
  fallbackMethods?: FallbackMethod[];
}

/**
 * UI configuration for biometric prompts
 */
export interface BiometricUIConfig {
  /** Primary/accent color */
  primaryColor?: string;
  /** Background color */
  backgroundColor?: string;
  /** Text color */
  textColor?: string;
  /** Custom logo URL or base64 */
  logo?: string;
}

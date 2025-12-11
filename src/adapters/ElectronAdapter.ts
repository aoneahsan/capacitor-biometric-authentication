import {
  BiometricAuthAdapter,
  BiometricAuthOptions,
  BiometricAuthResult,
  BiometricErrorCode,
  BiometryType
} from '../core/types';
import { generateSessionId } from '../utils/encoding';
import { createErrorResult } from '../utils/error-handler';

/**
 * Electron Adapter for biometric authentication
 * Supports:
 * - macOS: Touch ID via Electron's systemPreferences API
 * - Windows: Windows Hello via WebAuthn API
 */
export class ElectronAdapter implements BiometricAuthAdapter {
  platform = 'electron';
  private windowsHelloAvailable: boolean | null = null;

  constructor() {
    // Electron-specific initialization
  }

  /**
   * Check if Windows Hello is available
   */
  private async checkWindowsHello(): Promise<boolean> {
    // Cache the result since this check can be expensive
    if (this.windowsHelloAvailable !== null) {
      return this.windowsHelloAvailable;
    }

    try {
      // Check if PublicKeyCredential API is available (WebAuthn)
      if (typeof PublicKeyCredential !== 'undefined' &&
          typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        this.windowsHelloAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return this.windowsHelloAvailable;
      }
    } catch {
      // Windows Hello not available
    }

    this.windowsHelloAvailable = false;
    return false;
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Check if we're in Electron main or renderer process
      if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
        // In Electron, we can use TouchID on macOS
        if (process.platform === 'darwin') {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const electronModule = require('electron');
          const { systemPreferences } = electronModule.remote || electronModule;
          return systemPreferences.canPromptTouchID();
        }

        // On Windows, check for Windows Hello via WebAuthn
        if (process.platform === 'win32') {
          return await this.checkWindowsHello();
        }

        return false;
      }
      return false;
    } catch {
      return false;
    }
  }

  async getSupportedBiometrics(): Promise<BiometryType[]> {
    if (!(await this.isAvailable())) {
      return [];
    }

    // On macOS, we support Touch ID
    if (process.platform === 'darwin') {
      return [BiometryType.TOUCH_ID];
    }

    // On Windows, Windows Hello supports multiple biometric types
    if (process.platform === 'win32') {
      // Windows Hello can use fingerprint, face, or PIN
      // We report FINGERPRINT as the primary type, but it could also be face recognition
      return [BiometryType.FINGERPRINT, BiometryType.FACE_ID];
    }

    return [];
  }

  /**
   * Authenticate using Windows Hello via WebAuthn API
   */
  private async authenticateWithWindowsHello(options?: BiometricAuthOptions): Promise<BiometricAuthResult> {
    try {
      // Generate a random challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Get WebAuthn options from the options object
      const webAuthnGet = options?.webAuthnOptions?.get;
      const platformWeb = options?.platform?.web;

      // Create a credential request for platform authenticator (Windows Hello)
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: challenge.buffer,
        timeout: webAuthnGet?.timeout || platformWeb?.timeout || options?.sessionTimeout || 60000,
        userVerification: 'required',
        rpId: webAuthnGet?.rpId || platformWeb?.rpId || (typeof window !== 'undefined' ? window.location.hostname : 'localhost'),
      };

      // Request authentication
      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential | null;

      if (!credential) {
        return {
          success: false,
          error: {
            code: BiometricErrorCode.AUTHENTICATION_FAILED,
            message: 'Windows Hello authentication failed - no credential returned'
          }
        };
      }

      // Authentication successful
      return {
        success: true,
        biometryType: BiometryType.FINGERPRINT, // Windows Hello primary type
        sessionId: generateSessionId(),
        platform: 'electron',
      };
    } catch (error) {
      return createErrorResult(error, 'windows');
    }
  }

  async authenticate(options?: BiometricAuthOptions): Promise<BiometricAuthResult> {
    try {
      if (!(await this.isAvailable())) {
        return {
          success: false,
          error: {
            code: BiometricErrorCode.BIOMETRIC_UNAVAILABLE,
            message: 'Biometric authentication is not available'
          }
        };
      }

      // macOS Touch ID
      if (process.platform === 'darwin') {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const electronModule = require('electron');
        const { systemPreferences } = electronModule.remote || electronModule;

        try {
          await systemPreferences.promptTouchID(
            options?.reason || 'authenticate with Touch ID'
          );

          return {
            success: true,
            biometryType: BiometryType.TOUCH_ID,
            sessionId: generateSessionId(),
            platform: 'electron'
          };
        } catch (touchIdError) {
          return createErrorResult(touchIdError, 'electron');
        }
      }

      // Windows Hello
      if (process.platform === 'win32') {
        return await this.authenticateWithWindowsHello(options);
      }

      return {
        success: false,
        error: {
          code: BiometricErrorCode.PLATFORM_NOT_SUPPORTED,
          message: 'Platform not supported'
        }
      };
    } catch (error) {
      return createErrorResult(error, 'electron');
    }
  }

  async deleteCredentials(): Promise<void> {
    // Electron doesn't store biometric credentials
    // This is a no-op
  }

  async hasCredentials(): Promise<boolean> {
    // In Electron, we don't store credentials
    // Return true if biometrics are available
    return await this.isAvailable();
  }
}
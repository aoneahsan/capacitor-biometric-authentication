import {
  BiometricAuthAdapter,
  BiometricAuthOptions,
  BiometricAuthResult,
  BiometricErrorCode,
  BiometryType,
  WebAuthOptions
} from '../core/types';
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  generateSessionId as generateSecureSessionId,
} from '../utils/encoding';
import { createErrorResult } from '../utils/error-handler';

export class WebAdapter implements BiometricAuthAdapter {
  platform = 'web';
  private credentials = new Map<string, PublicKeyCredential>();
  private rpId: string;
  private rpName: string;

  constructor() {
    // Set default Relying Party info
    this.rpId = window.location.hostname;
    this.rpName = document.title || 'Biometric Authentication';
  }

  async isAvailable(): Promise<boolean> {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      return false;
    }

    // Check if platform authenticator is available
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch {
      return false;
    }
  }

  async getSupportedBiometrics(): Promise<BiometryType[]> {
    if (!(await this.isAvailable())) {
      return [];
    }

    // WebAuthn doesn't provide specific biometry types
    // Return generic "multiple" as modern devices support various methods
    return [BiometryType.MULTIPLE];
  }

  async authenticate(options?: BiometricAuthOptions): Promise<BiometricAuthResult> {
    try {
      // Check if WebAuthn is available
      if (!(await this.isAvailable())) {
        return {
          success: false,
          error: {
            code: BiometricErrorCode.BIOMETRIC_UNAVAILABLE,
            message: 'WebAuthn is not available on this device'
          }
        };
      }

      const webOptions = options?.platform?.web || {};
      
      // Try to get existing credential first
      const existingCredential = await this.getExistingCredential(webOptions);
      if (existingCredential) {
        return {
          success: true,
          biometryType: BiometryType.MULTIPLE,
          sessionId: generateSecureSessionId(),
          platform: 'web'
        };
      }

      // If no existing credential, create a new one
      const credential = await this.createCredential(options?.reason || 'Authentication required', webOptions);
      
      if (credential) {
        // Store credential for future use
        const credentialId = arrayBufferToBase64(credential.rawId);
        this.credentials.set(credentialId, credential);
        this.saveCredentialId(credentialId);

        return {
          success: true,
          biometryType: BiometryType.MULTIPLE,
          sessionId: generateSecureSessionId(),
          platform: 'web'
        };
      }

      return {
        success: false,
        error: {
          code: BiometricErrorCode.AUTHENTICATION_FAILED,
          message: 'Failed to authenticate'
        }
      };

    } catch (error) {
      return createErrorResult(error);
    }
  }

  async deleteCredentials(): Promise<void> {
    this.credentials.clear();
    localStorage.removeItem('biometric_credential_ids');
  }

  async hasCredentials(): Promise<boolean> {
    const storedIds = this.getStoredCredentialIds();
    return storedIds.length > 0;
  }

  private async getExistingCredential(options: WebAuthOptions): Promise<PublicKeyCredential | null> {
    const storedIds = this.getStoredCredentialIds();
    if (storedIds.length === 0) {
      return null;
    }

    try {
      const challenge = options.challenge || crypto.getRandomValues(new Uint8Array(32));
      
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: options.rpId || this.rpId,
        timeout: options.timeout || 60000,
        userVerification: options.userVerification || 'preferred',
        allowCredentials: storedIds.map(id => ({
          id: base64ToArrayBuffer(id),
          type: 'public-key'
        }))
      };

      const credential = await navigator.credentials.get({
        publicKey: publicKeyOptions
      }) as PublicKeyCredential;

      return credential;
    } catch {
      return null;
    }
  }

  private async createCredential(_reason: string, options: WebAuthOptions): Promise<PublicKeyCredential | null> {
    try {
      const challenge = options.challenge || crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(32));

      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          id: options.rpId || this.rpId,
          name: options.rpName || this.rpName
        },
        user: {
          id: userId,
          name: 'user@' + this.rpId,
          displayName: 'User'
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },  // ES256
          { type: 'public-key', alg: -257 } // RS256
        ],
        authenticatorSelection: options.authenticatorSelection || {
          authenticatorAttachment: 'platform',
          userVerification: 'preferred',
          requireResidentKey: false,
          residentKey: 'discouraged'
        },
        timeout: options.timeout || 60000,
        attestation: options.attestation || 'none'
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions
      }) as PublicKeyCredential;

      return credential;
    } catch {
      return null;
    }
  }

  private getStoredCredentialIds(): string[] {
    const stored = localStorage.getItem('biometric_credential_ids');
    if (!stored) {
      return [];
    }
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  private saveCredentialId(id: string) {
    const existing = this.getStoredCredentialIds();
    if (!existing.includes(id)) {
      existing.push(id);
      localStorage.setItem('biometric_credential_ids', JSON.stringify(existing));
    }
  }
}
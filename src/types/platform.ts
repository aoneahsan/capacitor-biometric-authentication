/**
 * Platform detection information
 */
export interface PlatformInfo {
  /** Platform name */
  name: string;
  /** Platform version */
  version?: string;
  /** Running in Capacitor */
  isCapacitor: boolean;
  /** Running in React Native */
  isReactNative: boolean;
  /** Running in Cordova */
  isCordova: boolean;
  /** Running in web browser */
  isWeb: boolean;
  /** Running on iOS */
  isIOS: boolean;
  /** Running on Android */
  isAndroid: boolean;
  /** Running in Electron */
  isElectron: boolean;
  /** Running on macOS */
  isMacOS?: boolean;
  /** Running on Windows */
  isWindows?: boolean;
  /** Running on Linux */
  isLinux?: boolean;
}

/**
 * Supported platforms
 */
export type SupportedPlatform = 'web' | 'ios' | 'android' | 'electron' | 'capacitor';

/**
 * Platform capability flags
 */
export interface PlatformCapabilities {
  /** Supports WebAuthn API */
  webAuthn: boolean;
  /** Supports native biometric API */
  nativeBiometric: boolean;
  /** Supports secure storage (Keychain/Keystore) */
  secureStorage: boolean;
  /** Supports platform authenticator */
  platformAuthenticator: boolean;
  /** Supports roaming authenticators */
  roamingAuthenticator: boolean;
}

/**
 * Get platform capabilities based on platform info
 */
export function getPlatformCapabilities(platform: PlatformInfo): PlatformCapabilities {
  if (platform.isWeb) {
    return {
      webAuthn: typeof window !== 'undefined' && 'PublicKeyCredential' in window,
      nativeBiometric: false,
      secureStorage: false,
      platformAuthenticator: true,
      roamingAuthenticator: true,
    };
  }

  if (platform.isIOS || platform.isAndroid) {
    return {
      webAuthn: false,
      nativeBiometric: true,
      secureStorage: true,
      platformAuthenticator: true,
      roamingAuthenticator: false,
    };
  }

  if (platform.isElectron) {
    return {
      webAuthn: true,
      nativeBiometric: platform.isMacOS || platform.isWindows || false,
      secureStorage: platform.isMacOS || false,
      platformAuthenticator: platform.isMacOS || platform.isWindows || false,
      roamingAuthenticator: true,
    };
  }

  return {
    webAuthn: false,
    nativeBiometric: false,
    secureStorage: false,
    platformAuthenticator: false,
    roamingAuthenticator: false,
  };
}

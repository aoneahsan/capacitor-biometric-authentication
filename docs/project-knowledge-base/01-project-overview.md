# Project Overview

**Last Updated:** 2025-12-02

## Identity

| Field | Value |
|-------|-------|
| Name | capacitor-biometric-authentication |
| Version | 2.0.3 |
| License | MIT |
| Author | Ahsan Mahmood (aoneahsan@gmail.com) |
| Repository | github.com/aoneahsan/capacitor-biometric-authentication |

## Description

Framework-agnostic biometric authentication library supporting Web, iOS, Android, and Electron platforms. Provider-less architecture (like Zustand) - no Context or Providers required.

## Key Features

| Feature | Description |
|---------|-------------|
| Zero Dependencies | Core works without framework dependencies |
| Provider-less | Direct API usage, no React Context/Providers |
| Multi-Platform | Web (WebAuthn), iOS (Touch ID/Face ID), Android (BiometricPrompt), Electron |
| Framework Agnostic | React, Vue, Angular, Vanilla JS |
| TypeScript First | Full type safety and IntelliSense |
| Secure Storage | Platform-specific secure storage (Keystore/Keychain) |
| Tree-shakeable | Dynamic imports, minimal bundle size |
| Backward Compatible | Works as Capacitor plugin |

## Tech Stack

### Core (TypeScript)
- **Language:** TypeScript 5.9+
- **Build:** Rollup with ESM/CJS/UMD outputs
- **Linting:** ESLint 9+ with TypeScript plugin
- **Formatting:** Prettier

### Web Platform
- **API:** W3C WebAuthn (Web Authentication API)
- **Storage:** localStorage (credentials), sessionStorage (sessions)
- **Encryption:** Web Crypto API (AES-256-GCM, PBKDF2)

### iOS Platform
- **Framework:** LocalAuthentication
- **Biometrics:** Touch ID, Face ID
- **Storage:** Keychain (credentials), UserDefaults (sessions)
- **Language:** Swift 5.1+
- **Min iOS:** 12.0

### Android Platform
- **API:** BiometricPrompt (AndroidX)
- **Biometrics:** Fingerprint, Face Recognition
- **Storage:** Android Keystore (keys), SharedPreferences (sessions)
- **Crypto:** AES-256-GCM, RSA/ECDSA signatures, HMAC
- **Language:** Java
- **Min SDK:** 23 (Android 6.0)

### Electron Platform
- **API:** systemPreferences (macOS Touch ID)
- **Supported:** macOS Touch ID
- **Planned:** Windows Hello

### Example App
- **Framework:** React 18+
- **Build:** Vite
- **UI Components:** Ionic PWA Elements

## Architecture Pattern

```
┌─────────────────────────────────────────────────────┐
│                  BiometricAuth API                   │
│          (Singleton, Provider-less)                  │
├─────────────────────────────────────────────────────┤
│               BiometricAuthCore                      │
│    (State Management, Session, Subscriptions)        │
├─────────────────────────────────────────────────────┤
│              Platform Detector                       │
│    (Auto-detect: Web/iOS/Android/Electron)          │
├──────────┬──────────┬──────────┬───────────────────┤
│ WebAdapter│CapAdapter│ElecAdapter│ Custom Adapters  │
│ (WebAuthn)│(Native)  │(TouchID)  │ (Extensible)     │
├──────────┴──────────┴──────────┴───────────────────┤
│            Native Implementations                    │
│  iOS: LocalAuthentication  │  Android: BiometricPrompt│
└─────────────────────────────────────────────────────┘
```

## Package Exports

| Export Path | Format | Description |
|-------------|--------|-------------|
| `.` (default) | ESM/CJS | Full library with all adapters |
| `./web` | ESM | Web-only bundle (smaller) |

## Bundle Outputs

| File | Format | Use Case |
|------|--------|----------|
| dist/esm/index.js | ESM | Modern bundlers |
| dist/plugin.cjs.js | CommonJS | Node.js, legacy bundlers |
| dist/plugin.js | IIFE | Script tag, unpkg |
| dist/plugin.mjs | ESM | Direct ESM import |
| dist/web.js | ESM | Web-only projects |
| dist/web.umd.js | UMD | Universal web use |

## Peer Dependencies

| Package | Version | Required |
|---------|---------|----------|
| @capacitor/core | ^7.4.4 | Optional |

## Browser Support

| Browser | Version | Features |
|---------|---------|----------|
| Chrome/Edge | 67+ | Windows Hello, Touch ID |
| Safari | 14+ | Touch ID, Face ID |
| Firefox | 60+ | Windows Hello |

## Native Requirements

### iOS
- Xcode 12+
- iOS 12.0+
- Face ID: NSFaceIDUsageDescription in Info.plist

### Android
- Android Studio
- SDK 23+ (Android 6.0)
- AndroidX BiometricPrompt
- USE_BIOMETRIC permission

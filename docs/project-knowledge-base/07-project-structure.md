# Project Structure

**Last Updated:** 2025-12-02

## Directory Layout

```
capacitor-biometric-authentication/
├── src/                          # TypeScript source code
│   ├── index.ts                  # Main entry point, exports
│   ├── definitions.ts            # Plugin interface definitions
│   ├── web.ts                    # Legacy WebPlugin implementation
│   ├── core/                     # Core functionality
│   │   ├── BiometricAuthCore.ts  # Singleton core class
│   │   ├── platform-detector.ts  # Platform detection
│   │   └── types.ts              # Core type definitions
│   ├── adapters/                 # Platform adapters
│   │   ├── WebAdapter.ts         # Web/WebAuthn adapter
│   │   ├── CapacitorAdapter.ts   # Capacitor native bridge
│   │   └── ElectronAdapter.ts    # Electron adapter
│   └── utils/                    # Utility functions
│       ├── index.ts              # Utils exports
│       ├── session.ts            # Session management
│       └── webauthn.ts           # WebAuthn utilities
├── android/                      # Android native code
│   ├── src/main/java/com/aoneahsan/capacitor/biometricauth/
│   │   └── BiometricAuthPlugin.java
│   ├── build.gradle
│   ├── gradle.properties
│   ├── proguard-rules.pro
│   ├── settings.gradle
│   └── variables.gradle
├── ios/                          # iOS native code
│   └── Plugin/
│       ├── BiometricAuthPlugin.swift
│       └── BiometricAuthPlugin.m
├── example/                      # React example app
│   ├── src/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── android/                  # Example Android project
│   ├── ios/                      # Example iOS project
│   ├── package.json
│   └── vite.config.ts
├── docs/                         # Documentation
│   ├── README.md
│   ├── CONTRIBUTING.md
│   ├── SECURITY.md
│   ├── getting-started/
│   ├── platform-guides/
│   ├── api-reference/
│   ├── configuration/
│   ├── error-handling/
│   ├── advanced-usage/
│   ├── migration/
│   └── project-knowledge-base/   # Complete project reference
├── dist/                         # Build output (generated)
│   ├── esm/                      # ES modules
│   ├── plugin.js                 # IIFE bundle
│   ├── plugin.cjs.js             # CommonJS
│   ├── plugin.mjs                # ESM bundle
│   ├── web.js                    # Web-only ESM
│   └── web.umd.js                # Web-only UMD
├── CLAUDE.md                     # AI assistant instructions
├── CHANGELOG.md                  # Version history
├── LICENSE                       # MIT license
├── Readme.md                     # Project readme
├── package.json                  # Package configuration
├── tsconfig.json                 # TypeScript config
├── rollup.config.js              # Rollup bundler config
├── eslint.config.js              # ESLint config
├── .prettierrc                   # Prettier config
├── .gitignore                    # Git ignore rules
└── CapacitorBiometricAuthentication.podspec  # CocoaPods spec
```

---

## Source Files Detail

### Entry Points

| File | Purpose | Exports |
|------|---------|---------|
| src/index.ts | Main entry | BiometricAuth (default), types, adapters |
| src/definitions.ts | Type definitions | Interfaces, enums for plugin API |
| src/web.ts | Legacy Capacitor web | BiometricAuthWeb class |

### Core Module

| File | Purpose | Key Classes/Functions |
|------|---------|----------------------|
| core/BiometricAuthCore.ts | Singleton core | BiometricAuthCore.getInstance() |
| core/platform-detector.ts | Platform detection | PlatformDetector.detect() |
| core/types.ts | Core types | BiometryType, BiometricError, etc. |

### Adapters

| File | Platform | Key Class |
|------|----------|-----------|
| adapters/WebAdapter.ts | Web (WebAuthn) | WebAdapter |
| adapters/CapacitorAdapter.ts | iOS/Android native | CapacitorAdapter |
| adapters/ElectronAdapter.ts | Electron (macOS) | ElectronAdapter |

### Utilities

| File | Purpose | Key Functions |
|------|---------|---------------|
| utils/session.ts | Session management | SessionManager, CredentialManager |
| utils/webauthn.ts | WebAuthn helpers | toArrayBuffer, mergeCreateOptions, etc. |
| utils/index.ts | Utils barrel export | Re-exports all utilities |

---

## Native Code Structure

### Android

```
android/src/main/java/com/aoneahsan/capacitor/biometricauth/
└── BiometricAuthPlugin.java    # Main plugin class
    ├── isAvailable()           # Check biometric availability
    ├── getSupportedBiometrics()# Get supported types
    ├── authenticate()          # Perform authentication
    ├── register()              # Register credentials
    ├── deleteCredentials()     # Delete stored credentials
    ├── configure()             # Set configuration
    └── [Crypto methods]        # Signature, cipher, MAC operations
```

**Dependencies:**
- androidx.biometric:biometric
- Android Keystore
- SharedPreferences

### iOS

```
ios/Plugin/
├── BiometricAuthPlugin.swift   # Main plugin class
│   ├── isAvailable()
│   ├── getSupportedBiometrics()
│   ├── authenticate()
│   ├── register()
│   ├── deleteCredentials()
│   └── configure()
└── BiometricAuthPlugin.m       # Objective-C bridge
```

**Frameworks:**
- LocalAuthentication
- Security (Keychain)

---

## Build Configuration

### TypeScript (tsconfig.json)

| Setting | Value | Purpose |
|---------|-------|---------|
| target | ES2017 | Output compatibility |
| module | ES2020 | ESM output |
| strict | true | Type safety |
| declaration | true | Generate .d.ts |
| outDir | dist/esm | Output directory |

### Rollup (rollup.config.js)

**Main Build:**
| Output | Format | Name |
|--------|--------|------|
| dist/plugin.js | IIFE | BiometricAuth |
| dist/plugin.cjs.js | CJS | - |
| dist/plugin.mjs | ES | - |

**Web Build:**
| Output | Format | Name |
|--------|--------|------|
| dist/web.js | ES | - |
| dist/web.umd.js | UMD | BiometricAuth |

### ESLint (eslint.config.js)

- Parser: @typescript-eslint/parser
- Plugins: @typescript-eslint
- Rules: recommended + custom overrides
- Ignores: dist, node_modules, android, ios, example

---

## Package Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| build | clean && tsc && rollup | Full build |
| clean | rimraf ./dist | Clean output |
| tsc | tsc | TypeScript compile |
| watch | tsc --watch | Development mode |
| lint | eslint . --ext ts | Lint code |
| prettier | prettier --write . | Format code |
| swiftlint | swiftlint (in ios/) | Lint Swift code |
| prepublishOnly | npm run build | Pre-publish hook |

---

## Package Exports

### package.json exports

```json
{
  ".": {
    "import": "./dist/esm/index.js",
    "require": "./dist/plugin.cjs.js",
    "types": "./dist/esm/index.d.ts"
  },
  "./web": {
    "import": "./dist/web.js",
    "types": "./dist/esm/index.d.ts"
  }
}
```

### Published Files

```json
{
  "files": [
    "android/src/main/",
    "android/build.gradle",
    "android/variables.gradle",
    "android/gradle.properties",
    "android/settings.gradle",
    "android/proguard-rules.pro",
    "dist/",
    "ios/Plugin/",
    "CapacitorBiometricAuthentication.podspec",
    "src/"
  ]
}
```

---

## Example App Structure

```
example/
├── src/
│   ├── App.tsx                 # Main demo component
│   ├── main.tsx                # React entry
│   └── index.css               # Styles
├── android/                    # Capacitor Android
├── ios/                        # Capacitor iOS
├── public/                     # Static assets
├── package.json                # Example dependencies
├── vite.config.ts              # Vite configuration
├── capacitor.config.ts         # Capacitor config
└── tsconfig.json               # TypeScript config
```

**Tech Stack:**
- React 18+
- TypeScript
- Vite
- Ionic PWA Elements
- Capacitor CLI

---

## Documentation Structure

```
docs/
├── README.md                   # Docs index
├── CONTRIBUTING.md             # Contributing guide
├── SECURITY.md                 # Security policy
├── getting-started/
│   ├── installation.md
│   └── quick-start.md
├── platform-guides/
│   ├── android.md
│   ├── ios.md
│   └── web.md
├── api-reference/
│   ├── methods.md
│   └── types.md
├── configuration/
│   ├── options.md
│   └── customization.md
├── error-handling/
│   ├── overview.md
│   └── troubleshooting.md
├── advanced-usage/
│   ├── integration-examples.md
│   ├── security.md
│   └── session-management.md
├── migration/
│   ├── faq.md
│   └── from-other-plugins.md
└── project-knowledge-base/     # Complete reference
    ├── README.md
    ├── 01-project-overview.md
    ├── 02-api-reference.md
    ├── 03-types-interfaces.md
    ├── 04-platform-implementations.md
    ├── 05-configuration.md
    ├── 06-error-handling.md
    └── 07-project-structure.md
```

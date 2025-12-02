# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Capacitor plugin for biometric authentication across Android, iOS, and Web platforms. The plugin provides a secure, type-safe, and framework-independent solution for biometric authentication with features like session management, encryption, and multiple authentication methods.

## Development Commands

### Plugin Development (Main Package)
```bash
# Build the plugin
npm run build

# Watch for TypeScript changes
npm run watch

# Run linting
npm run lint

# Format code
npm run prettier

# Clean build artifacts
npm run clean

# Lint iOS Swift code
npm run swiftlint
```

### Example App Development
Navigate to the `example/` directory for testing:
```bash
cd example

# Development server
npm run dev

# Build and sync with native projects
npm run cap:sync

# Run on platforms
npm run cap:android:run
npm run cap:ios:run
```

## Architecture and Code Structure

### Plugin Architecture

```
├── src/                        # TypeScript source
│   ├── definitions.ts          # Complete API interfaces and types
│   ├── index.ts               # Plugin registration
│   ├── web.ts                 # Web implementation (WebAuthn)
│   └── utils/                 # Utility functions
│       ├── index.ts           # Utils exports
│       └── session.ts         # Session management
├── android/                    # Android native implementation
│   └── src/main/java/.../
│       └── BiometricAuthPlugin.java  # BiometricPrompt API
├── ios/                        # iOS native implementation
│   └── Plugin/
│       └── BiometricAuthPlugin.swift  # LocalAuthentication framework
└── example/                    # React example app for testing
```

### Key Technologies

- **Build System**: Rollup for bundling, TypeScript for compilation
- **Native Android**: BiometricPrompt API with Android Keystore
- **Native iOS**: LocalAuthentication framework with Keychain
- **Web**: WebAuthn API for browser biometric support
- **Example App**: React + Vite for testing

### Plugin API Methods

1. `isAvailable()` - Check biometric availability
2. `getSupportedBiometrics()` - Get available biometric types
3. `authenticate(options?)` - Perform authentication
4. `deleteCredentials()` - Clear stored credentials
5. `configure(config)` - Set plugin configuration

### Current Implementation Status

- ✅ Complete TypeScript definitions and interfaces
- ✅ Web implementation with WebAuthn
- ✅ Android native implementation
- ✅ iOS native implementation
- ⚠️  Utils implementation (placeholders exist)
- ✅ Example app structure

## Development Workflow

### Making Plugin Changes

1. Edit TypeScript files in `src/`
2. Run `npm run build` to compile and bundle
3. For native changes:
   - Android: Edit Java files in `android/src/main/java/`
   - iOS: Edit Swift files in `ios/Plugin/`
4. Test changes in the example app:
   ```bash
   cd example
   npm run cap:sync
   npm run cap:android:run  # or cap:ios:run
   ```

### Testing on Devices

1. Ensure the plugin is built: `npm run build` (in root)
2. Link the plugin in example app (if not already linked)
3. Sync and run: `npm run cap:sync` then platform-specific run command

### Publishing Updates

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run `npm run build`
4. Publish: `npm publish`

## Platform-Specific Notes

### Android
- Minimum SDK: 23 (Android 6.0)
- Uses BiometricPrompt for modern biometric authentication
- Stores encrypted credentials in SharedPreferences
- Supports fingerprint, face recognition, and device credentials

### iOS
- Minimum iOS version: 12.0
- Uses LocalAuthentication framework
- Supports Touch ID and Face ID
- Stores credentials in Keychain

### Web
- Uses WebAuthn API where available
- Falls back to session-based authentication
- Stores encrypted data in localStorage

## Code Style Guidelines

- TypeScript strict mode enabled
- 2-space indentation (enforced by .editorconfig)
- Use async/await for asynchronous operations
- Follow existing patterns in the codebase
- All public APIs must be fully typed

## Project Organization Rules

### Root Directory
Keep the root directory clean. Only the following files should remain at root:
- `CLAUDE.md` - AI assistant instructions
- `CHANGELOG.md` - Version history
- `LICENSE` - License file
- `Readme.md` - Main project readme
- Configuration files (package.json, tsconfig.json, rollup.config.js, etc.)
- Dot files (.eslintrc, .prettierrc, .gitignore, etc.)

### Documentation (`docs/`)
All documentation files (except Readme.md, CHANGELOG.md, LICENSE) must be placed in the `docs/` folder with proper nesting:
```
docs/
├── README.md              # Docs index
├── CONTRIBUTING.md        # Contribution guidelines
├── SECURITY.md           # Security policy
├── getting-started/      # Installation and quick start
├── api-reference/        # API methods and types
├── configuration/        # Options and customization
├── platform-guides/      # Platform-specific docs (android, ios, web)
├── advanced-usage/       # Security, sessions, integrations
├── error-handling/       # Error overview and troubleshooting
└── migration/            # Migration guides and FAQ
```

### Scripts
If standalone script files are needed, place them in a `scripts/` folder at root. Currently, all scripts are defined in package.json.

### No Unnecessary Files
Do NOT create documentation, text, or record-keeping files unless:
- Explicitly requested by the user
- Absolutely required for the project to function

Skip creating: changelogs for minor changes, TODO.md files, NOTES.txt, scratch files, or any "for the record" type files. Keep the project lean.

## Security Considerations

- Never store sensitive data in plain text
- Use platform-specific secure storage (Keystore/Keychain)
- Implement proper session management
- Clear credentials on app uninstall
- Handle authentication failures gracefully

## Common Development Tasks

### Adding a New Method
1. Define the method interface in `src/definitions.ts`
2. Implement in `src/web.ts` for web platform
3. Implement in native files for Android/iOS
4. Add to the plugin exports
5. Test in the example app

### Debugging Native Code
- **Android**: Open in Android Studio via the example app
- **iOS**: Open in Xcode via the example app
- Use platform-specific debugging tools and logs

### Updating Dependencies
```bash
# Update Capacitor to latest
npm update @capacitor/core @capacitor/android @capacitor/ios

# Update dev dependencies
npm update

# Check for outdated packages
npm outdated
```
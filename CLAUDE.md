# CLAUDE.md

**Last Updated:** 2025-12-07
**Readme.md Last Updated:** 2025-12-02
**Project Knowledge Base Last Updated:** 2025-12-02

## ⚠️ CRITICAL: Build & Link After Changes

**MANDATORY RULE**: After making ANY changes to this package, you MUST:

1. **Build the package**: `yarn build`
2. The package is linked via `yarn link` to `frontend-test-app`

This ensures changes are immediately available for testing without publishing.

### Link Status
- ✅ `frontend-test-app` - linked via `yarn link "capacitor-biometric-authentication"`

### Quick Command
```bash
# After making changes, run from this directory:
yarn build
```

## Project Overview

Capacitor plugin for biometric authentication (Android, iOS, Web). Framework-agnostic, provider-less architecture. Version 2.0.3.

| Platform | Technology | Min Version |
|----------|------------|-------------|
| Android | BiometricPrompt + Keystore | SDK 23 |
| iOS | LocalAuthentication + Keychain | iOS 12.0 |
| Web | WebAuthn API | Chrome 67+, Safari 14+, Firefox 60+ |
| Electron | Touch ID (macOS) | - |

## Commands

```bash
# Plugin
yarn build              # Build plugin
yarn watch              # Watch mode
yarn lint               # Lint code
yarn prettier           # Format code

# Example app
cd example
yarn dev                # Dev server
yarn cap:sync           # Sync native
yarn cap:android:run    # Run Android
yarn cap:ios:run        # Run iOS
```

## Structure

```
src/
├── index.ts            # Entry, exports
├── definitions.ts      # API types
├── web.ts              # WebAuthn impl
├── core/               # Core logic, platform detection
├── adapters/           # Web, Capacitor, Electron adapters
└── utils/              # Session, WebAuthn utilities
android/                # BiometricPrompt implementation
ios/                    # LocalAuthentication implementation
example/                # React test app
docs/                   # All documentation
  └── project-knowledge-base/  # Complete technical reference
```

## API Methods

| Method | Description |
|--------|-------------|
| `isAvailable()` | Check biometric availability |
| `getSupportedBiometrics()` | Get available biometric types |
| `authenticate(options?)` | Perform authentication |
| `deleteCredentials()` | Clear stored credentials |
| `configure(config)` | Set configuration |
| `logout()` | Clear session |
| `getState()` | Get auth state |
| `subscribe(callback)` | Subscribe to state changes |

## Development Workflow

1. Edit TypeScript in `src/`
2. `yarn build` to compile
3. Native changes: `android/` or `ios/Plugin/`
4. Test: `cd example && yarn cap:sync && yarn cap:android:run`

## Rules

### Root Directory
Keep clean. Only at root: CLAUDE.md, CHANGELOG.md, LICENSE, Readme.md, config files, dot files.

### Documentation
All docs in `docs/` folder with proper nesting. Exception: Readme.md, CHANGELOG.md, LICENSE stay at root.

### No Scripts
No .sh files or scripts folder. Use package.json scripts or run commands directly. Only create if explicitly requested.

### No Unnecessary Files
Don't create docs/txt/record files unless explicitly requested or absolutely required. No TODO.md, NOTES.txt, scratch files.

### Gitignore Policy
Ask "Private or public project?" before configuring:
- **Private**: Secrets OK in git, only ignore builds/logs
- **Public**: No secrets, .env, sensitive info

Always include: `*.ignore.*`, `project-record-ignore/`

Capacitor: Include android/ios source, ignore `.gradle/`, `build/`, `Pods/`, `DerivedData/`, `local.properties`

### Package Manager
- **Project**: `yarn` (yarn add, yarn install)
- **Global**: `pnpm` (pnpm add -g)
- **Install pnpm**: `npm install -g pnpm`
- **Install yarn**: `pnpm add -g yarn`

### Maintenance Schedule
Update every 2 weeks or when significant changes occur:
- **CLAUDE.md**: Update "Last Updated" date at top
- **Readme.md**: Update "Readme.md Last Updated" date
- **Project Knowledge Base**: Update "Project Knowledge Base Last Updated" date

### Project Knowledge Base
`docs/project-knowledge-base/` contains complete technical docs:
- 01-project-overview.md - Tech stack, architecture
- 02-api-reference.md - All methods, signatures
- 03-types-interfaces.md - TypeScript definitions
- 04-platform-implementations.md - Platform details
- 05-configuration.md - Config options
- 06-error-handling.md - Error codes, patterns
- 07-project-structure.md - Files, build config

## Code Style

- TypeScript strict mode
- 2-space indentation
- async/await for async ops
- All public APIs fully typed

## Adding New Method

1. Define interface in `src/definitions.ts`
2. Implement in `src/web.ts`
3. Implement in `android/` and `ios/`
4. Export from `src/index.ts`
5. Test in example app

## Security

- Platform-specific secure storage (Keystore/Keychain)
- Never store sensitive data plain text
- Proper session management
- Handle auth failures gracefully

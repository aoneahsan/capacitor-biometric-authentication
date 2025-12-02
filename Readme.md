# Biometric Authentication

A framework-agnostic biometric authentication library for React, Vue, Angular, or vanilla JavaScript. No providers required!

## Features

- **Zero Dependencies** - Works without any specific framework (Capacitor optional)
- **Provider-less** - Direct API like Zustand, no Context/Providers needed
- **Multi-Platform** - Web (WebAuthn), iOS, Android, Electron support
- **Framework Agnostic** - Works with React, Vue, Angular, Vanilla JS
- **TypeScript First** - Full type safety and IntelliSense
- **Secure by Default** - Platform-specific secure storage
- **Tiny Bundle** - Tree-shakeable with dynamic imports
- **Backward Compatible** - Works as a Capacitor plugin too

## Installation

```bash
npm install capacitor-biometric-authentication
# or
yarn add capacitor-biometric-authentication
```

## Quick Start

```javascript
import BiometricAuth from 'capacitor-biometric-authentication';

// Check availability
const isAvailable = await BiometricAuth.isAvailable();

// Authenticate
const result = await BiometricAuth.authenticate({
  reason: 'Please authenticate to continue'
});

if (result.success) {
  console.log('Authentication successful!');
}
```

---

## Production Integration Guide

This section provides step-by-step instructions for integrating this plugin into a production Capacitor app.

### Prerequisites

- Node.js 18+
- Capacitor 7.x
- For iOS: Xcode 15+, CocoaPods
- For Android: Android Studio, JDK 17

### Step 1: Install the Plugin

```bash
npm install capacitor-biometric-authentication
```

### Step 2: Sync Native Projects

```bash
npx cap sync
```

### Step 3: Platform-Specific Configuration

#### Android Configuration

**Minimum Requirements:**
- `minSdkVersion`: 23 (Android 6.0)
- `compileSdkVersion`: 35
- Java 17

The plugin automatically includes required permissions in its AndroidManifest.xml:
```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

**Verify Gradle Settings** (android/app/build.gradle):
```groovy
android {
    compileSdkVersion 35

    defaultConfig {
        minSdkVersion 23
        targetSdkVersion 35
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}
```

#### iOS Configuration

**Minimum Requirements:**
- iOS 13.0+
- Swift 5.1+

**Required Info.plist Entry:**

Add to `ios/App/App/Info.plist`:
```xml
<key>NSFaceIDUsageDescription</key>
<string>We use Face ID to securely authenticate you</string>
```

**Note:** This key is required for Face ID devices. Without it, your app will crash when attempting Face ID authentication.

#### Web Configuration

**Requirements:**
- HTTPS (or localhost for development)
- Browser with WebAuthn support (Chrome 67+, Safari 14+, Firefox 60+, Edge 79+)
- Platform authenticator (TouchID, Windows Hello, etc.)

**Development:**
```bash
npm run dev  # localhost works without HTTPS
```

**Production:**
Ensure your site uses HTTPS. WebAuthn will not work on non-secure origins.

### Step 4: Use the Plugin

```typescript
import BiometricAuth from 'capacitor-biometric-authentication';

// Check if biometrics are available
const available = await BiometricAuth.isAvailable();

if (available) {
  // Configure session duration (in seconds)
  BiometricAuth.configure({
    sessionDuration: 3600, // 1 hour
  });

  // Authenticate
  const result = await BiometricAuth.authenticate({
    reason: 'Authenticate to access your account',
    fallbackTitle: 'Use Passcode',
  });

  if (result.success) {
    console.log('Authenticated!');
  } else {
    console.error('Auth failed:', result.error?.message);
  }
}
```

### Step 5: Build and Run

**Web:**
```bash
npm run build
npm run preview
```

**Android:**
```bash
npx cap sync android
npx cap run android
# or open in Android Studio:
npx cap open android
```

**iOS:**
```bash
npx cap sync ios
cd ios && pod install && cd ..
npx cap run ios
# or open in Xcode:
npx cap open ios
```

---

## Framework Examples

### React Example

```jsx
import { useState, useEffect } from 'react';
import BiometricAuth from 'capacitor-biometric-authentication';

function SecureComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = BiometricAuth.subscribe((state) => {
      setIsAuthenticated(state.isAuthenticated);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    const result = await BiometricAuth.authenticate({ reason: 'Access your account' });
    if (!result.success) console.error('Auth failed:', result.error);
  };

  return isAuthenticated
    ? <h1>Welcome back!</h1>
    : <button onClick={handleLogin}>Login with Biometrics</button>;
}
```

### Vue Example

```vue
<template>
  <button v-if="!isAuthenticated" @click="authenticate">Login with Biometrics</button>
  <div v-else>Welcome back!</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import BiometricAuth from 'capacitor-biometric-authentication';

const isAuthenticated = ref(false);
let unsubscribe;

onMounted(() => {
  unsubscribe = BiometricAuth.subscribe((state) => {
    isAuthenticated.value = state.isAuthenticated;
  });
});

onUnmounted(() => unsubscribe?.());

const authenticate = () => BiometricAuth.authenticate({ reason: 'Access your account' });
</script>
```

### Vanilla JavaScript

```html
<script type="module">
  import BiometricAuth from 'https://unpkg.com/capacitor-biometric-authentication/dist/web.js';

  document.getElementById('auth-btn').addEventListener('click', async () => {
    const result = await BiometricAuth.authenticate({ reason: 'Please authenticate' });
    if (result.success) document.getElementById('status').textContent = 'Authenticated!';
  });
</script>
<button id="auth-btn">Authenticate</button>
<div id="status"></div>
```

---

## API Reference

### Core Methods

| Method | Description |
|--------|-------------|
| `isAvailable()` | Check if biometric auth is available |
| `getSupportedBiometrics()` | Get available biometric types |
| `authenticate(options?)` | Perform authentication |
| `deleteCredentials()` | Clear stored credentials |
| `configure(config)` | Set plugin configuration |
| `logout()` | Clear authentication session |

### State Management

| Method | Description |
|--------|-------------|
| `subscribe(callback)` | Subscribe to auth state changes |
| `getState()` | Get current auth state |
| `isAuthenticated()` | Check if currently authenticated |

### Utility Methods

| Method | Description |
|--------|-------------|
| `requireAuthentication(callback, options?)` | Execute callback after auth |
| `withAuthentication(callback, options?)` | Wrap operation with auth |

### Configuration Options

```typescript
BiometricAuth.configure({
  sessionDuration: 3600,  // Session duration in SECONDS (default: 300)
  debug: false,           // Enable debug logging
});
```

### Authentication Options

```typescript
await BiometricAuth.authenticate({
  reason: 'Authentication Required',      // Displayed to user
  title: 'Biometric Login',               // Android dialog title
  subtitle: 'Log in to your account',     // Android dialog subtitle
  fallbackTitle: 'Use Passcode',          // Fallback button text
  cancelTitle: 'Cancel',                  // Cancel button text
  disableDeviceCredential: false,         // Disable passcode fallback
  maxAttempts: 3,                         // Max failed attempts before lockout
  saveCredentials: true,                  // Store credentials for future use
});
```

---

## Platform Support

| Platform | Technology | Min Version | Status |
|----------|------------|-------------|--------|
| Web | WebAuthn API | Chrome 67+ | ✅ |
| iOS | Touch ID / Face ID | iOS 13.0 | ✅ |
| Android | BiometricPrompt | API 23 | ✅ |
| Electron | Touch ID (macOS) | - | ✅ |

### Browser Support

- Chrome/Edge 67+ (Windows Hello, Touch ID)
- Safari 14+ (Touch ID, Face ID)
- Firefox 60+ (Windows Hello)

---

## Error Handling

```typescript
import BiometricAuth, { BiometricErrorCode } from 'capacitor-biometric-authentication';

const result = await BiometricAuth.authenticate();

if (!result.success) {
  switch (result.error?.code) {
    case BiometricErrorCode.USER_CANCELLED:
      console.log('User cancelled');
      break;
    case BiometricErrorCode.AUTHENTICATION_FAILED:
      console.log('Biometric not recognized');
      break;
    case BiometricErrorCode.BIOMETRIC_UNAVAILABLE:
      console.log('Biometric not available');
      break;
    case BiometricErrorCode.LOCKOUT:
      console.log('Too many failed attempts');
      break;
    case BiometricErrorCode.NOT_ENROLLED:
      console.log('No biometrics enrolled');
      break;
    default:
      console.log('Unknown error:', result.error?.message);
  }
}
```

---

## Troubleshooting

For build failures and common integration issues, see the comprehensive [Troubleshooting Guide](./TROUBLESHOOTING.md).

Common issues covered:
- Android Gradle/SDK version mismatches
- iOS Info.plist missing entries
- Pod installation failures
- WebAuthn HTTPS requirements
- Plugin registration issues

---

## Development

```bash
# Install dependencies
yarn install

# Build plugin
yarn build

# Watch mode
yarn watch

# Lint & format
yarn lint
yarn prettier

# Test in example app
cd example
yarn install
yarn dev           # Web development
yarn cap:sync      # Sync native platforms
yarn cap:ios:run   # Run on iOS
yarn cap:android:run  # Run on Android
```

### Project Structure

```
├── src/                  # TypeScript source
│   ├── definitions.ts    # API interfaces
│   ├── index.ts          # Plugin entry
│   ├── web.ts            # Web implementation
│   ├── core/             # Core logic
│   ├── adapters/         # Platform adapters
│   └── utils/            # Utilities
├── android/              # Android native (BiometricPrompt)
├── ios/                  # iOS native (LocalAuthentication)
├── example/              # React example app
└── docs/                 # Documentation
```

---

## Plugin Metadata

| Property | Value |
|----------|-------|
| Package Name | `capacitor-biometric-authentication` |
| Plugin ID | `BiometricAuth` |
| Android Package | `com.aoneahsan.capacitor.biometricauth` |
| iOS Class | `BiometricAuthPlugin` |
| Capacitor Version | 7.x |

---

## Documentation

Full documentation in [`docs/`](./docs/):

- [Installation Guide](./docs/getting-started/installation.md)
- [Quick Start](./docs/getting-started/quick-start.md)
- [Platform Guides](./docs/platform-guides/) - iOS, Android, Web
- [API Reference](./docs/api-reference/methods.md)
- [FAQ](./docs/migration/faq.md)

## Contributing

See [Contributing Guide](./docs/CONTRIBUTING.md) for details.

## Support

- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [GitHub Issues](https://github.com/aoneahsan/capacitor-biometric-authentication/issues)
- [Email](mailto:aoneahsan@gmail.com)

## License

MIT © [Ahsan Mahmood](https://github.com/aoneahsan)

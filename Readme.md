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

### Authentication Options

```typescript
await BiometricAuth.authenticate({
  title: 'Authentication Required',
  subtitle: 'Log in to your account',
  description: 'Use biometrics to continue',
  fallbackButtonTitle: 'Use Passcode',
  cancelButtonTitle: 'Cancel',
  disableFallback: false,
  maxAttempts: 3,
  saveCredentials: true,
  webAuthnOptions: { /* WebAuthn specific */ },
  androidOptions: { /* Android specific */ }
});
```

## Platform Support

| Platform | Technology | Status |
|----------|------------|--------|
| Web | WebAuthn API | ✅ |
| iOS | Touch ID / Face ID | ✅ |
| Android | BiometricPrompt | ✅ |
| Electron | Touch ID (macOS) | ✅ |

### Browser Support

- Chrome/Edge 67+ (Windows Hello, Touch ID)
- Safari 14+ (Touch ID, Face ID)
- Firefox 60+ (Windows Hello)

## Error Handling

```typescript
const result = await BiometricAuth.authenticate();

if (!result.success) {
  switch (result.error.code) {
    case 'userCancelled': break;      // User cancelled
    case 'authenticationFailed': break; // Biometric not recognized
    case 'notAvailable': break;        // Biometric unavailable
    case 'lockedOut': break;           // Too many failed attempts
  }
}
```

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
cd example && yarn dev
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

- [Documentation](./docs/README.md)
- [GitHub Issues](https://github.com/aoneahsan/capacitor-biometric-authentication/issues)
- [Email](mailto:aoneahsan@gmail.com)

## License

MIT © [Ahsan Mahmood](https://github.com/aoneahsan)

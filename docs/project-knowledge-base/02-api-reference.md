# API Reference

**Last Updated:** 2025-12-02

## Core Authentication Methods

### isAvailable()

Check if biometric authentication is available.

```typescript
isAvailable(): Promise<boolean>
```

**Returns:** `true` if biometrics available and enrolled, `false` otherwise.

**Platform Behavior:**
| Platform | Implementation |
|----------|---------------|
| Web | Checks PublicKeyCredential and platform authenticator |
| iOS | LAContext canEvaluatePolicy |
| Android | BiometricManager canAuthenticate |
| Electron | systemPreferences.canPromptTouchID() |

---

### getSupportedBiometrics()

Get available biometric types on current device.

```typescript
getSupportedBiometrics(): Promise<BiometryType[]>
```

**Returns:** Array of supported biometric types.

**Platform Results:**
| Platform | Possible Values |
|----------|----------------|
| Web | `['fingerprint', 'faceAuthentication']` |
| iOS | `['touchId']` or `['faceId']` |
| Android | `['fingerprint']`, `['faceAuthentication']`, or both |
| Electron | `['touchId']` (macOS only) |

---

### authenticate(options?)

Perform biometric authentication.

```typescript
authenticate(options?: BiometricAuthOptions): Promise<BiometricAuthResult>
```

**Parameters:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| title | string | "Authentication Required" | Prompt title |
| subtitle | string | - | Prompt subtitle (Android) |
| description | string | - | Prompt description |
| fallbackButtonTitle | string | "Use Passcode" | Fallback button text |
| cancelButtonTitle | string | "Cancel" | Cancel button text |
| disableFallback | boolean | false | Disable passcode fallback |
| maxAttempts | number | 3 | Max failed attempts |
| saveCredentials | boolean | false | Save credentials (Web) |
| webAuthnOptions | WebAuthnOptions | - | WebAuthn-specific options |
| androidOptions | AndroidBiometricOptions | - | Android-specific options |

**Returns:** `BiometricAuthResult` with success status, token, sessionId, and optional error.

---

### register(options?)

Register new biometric credentials (Web platform).

```typescript
register?(options?: BiometricAuthOptions): Promise<BiometricAuthResult>
```

**Note:** Web-specific. On native platforms, registration is handled by the OS.

---

### deleteCredentials()

Delete all stored biometric credentials.

```typescript
deleteCredentials(): Promise<void>
```

**Platform Behavior:**
| Platform | Action |
|----------|--------|
| Web | Clears localStorage credentials, sessions |
| iOS | Removes Keychain entries, UserDefaults |
| Android | Clears SharedPreferences, removes Keystore keys |

---

### configure(config)

Set plugin configuration.

```typescript
configure(config: BiometricAuthConfig): Promise<void>
```

**Parameters:** See [Configuration](./05-configuration.md) for full options.

---

## State Management Methods

### logout()

Clear authentication session.

```typescript
logout(): void
```

Resets state to unauthenticated, clears sessionId and lastAuthTime.

---

### getState()

Get current authentication state.

```typescript
getState(): BiometricAuthState
```

**Returns:**
```typescript
{
  isAuthenticated: boolean;
  sessionId?: string;
  lastAuthTime?: number;
  biometryType?: BiometryType;
  error?: BiometricError;
}
```

---

### isAuthenticated()

Check if currently authenticated.

```typescript
isAuthenticated(): boolean
```

Returns `true` if authenticated and session not expired.

---

### subscribe(callback)

Subscribe to authentication state changes.

```typescript
subscribe(callback: (state: BiometricAuthState) => void): () => void
```

**Returns:** Unsubscribe function.

**Example:**
```typescript
const unsubscribe = BiometricAuth.subscribe((state) => {
  console.log('Auth changed:', state.isAuthenticated);
});

// Later: unsubscribe();
```

---

## Utility Methods

### requireAuthentication(callback, options?)

Execute callback only after successful authentication.

```typescript
requireAuthentication(
  callback: () => void | Promise<void>,
  options?: BiometricAuthOptions
): Promise<void>
```

Re-authenticates if session expired.

---

### withAuthentication(callback, options?)

Wrap operation with authentication requirement.

```typescript
withAuthentication<T>(
  callback: () => T | Promise<T>,
  options?: BiometricAuthOptions
): Promise<T>
```

Type-safe wrapper that returns callback result.

---

### registerAdapter(name, adapter)

Register custom platform adapter.

```typescript
registerAdapter(name: string, adapter: BiometricAuthAdapter): void
```

**Adapter Interface:**
```typescript
interface BiometricAuthAdapter {
  platform: string;
  isAvailable(): Promise<boolean>;
  getSupportedBiometrics(): Promise<BiometryType[]>;
  authenticate(options?: BiometricAuthOptions): Promise<BiometricAuthResult>;
  deleteCredentials(): Promise<void>;
  hasCredentials(): Promise<boolean>;
}
```

---

### hasCredentials()

Check if credentials are stored.

```typescript
hasCredentials(): Promise<boolean>
```

**Platform Behavior:**
| Platform | Check |
|----------|-------|
| Web | localStorage credential IDs |
| iOS | Keychain entries |
| Android | SharedPreferences entries |

---

## Method Summary Table

| Method | Category | Async | Returns |
|--------|----------|-------|---------|
| isAvailable() | Core | Yes | boolean |
| getSupportedBiometrics() | Core | Yes | BiometryType[] |
| authenticate(options?) | Core | Yes | BiometricAuthResult |
| register(options?) | Core | Yes | BiometricAuthResult |
| deleteCredentials() | Core | Yes | void |
| configure(config) | Core | Yes | void |
| logout() | State | No | void |
| getState() | State | No | BiometricAuthState |
| isAuthenticated() | State | No | boolean |
| subscribe(callback) | State | No | () => void |
| requireAuthentication() | Utility | Yes | void |
| withAuthentication() | Utility | Yes | T |
| registerAdapter() | Advanced | No | void |
| hasCredentials() | Utility | Yes | boolean |

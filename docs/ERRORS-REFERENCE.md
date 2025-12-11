# ERRORS REFERENCE

> **SUPER IMPORTANT - DO NOT DELETE**
>
> This file documents errors encountered during development of this package.
> Use as reference for troubleshooting similar issues in other packages.

---

## Table of Contents
1. [Android Build Errors](#android-build-errors)
2. [iOS Build Errors](#ios-build-errors)
3. [Web/TypeScript Errors](#webtypescript-errors)
4. [Capacitor Sync Errors](#capacitor-sync-errors)

---

## Android Build Errors

### 1. JSONObject.getInt() Does Not Support Default Values

**Date:** 2025-12-11
**Version:** 2.1.0 → 2.1.1
**Severity:** Critical (Build Failure)

**Error Message:**
```
> Task :capacitor-biometric-authentication:compileReleaseJavaWithJavac FAILED

error: method getInt in class JSONObject cannot be applied to given types;
        int keySize = androidOptions.getInt("keySize", 256);
                                    ^
  required: String
  found:    String,int
  reason: actual and formal argument lists differ in length
```

**Cause:**
Android's `org.json.JSONObject.getInt(String name)` method only accepts ONE parameter (the key name). It does NOT support a default value parameter like JavaScript/TypeScript APIs do.

**Wrong Code:**
```java
int keySize = androidOptions.getInt("keySize", 256);
int authValidityDuration = androidOptions.getInt("authenticationValidityDuration", -1);
```

**Fix:**
Use `optInt()` instead of `getInt()`. The `optInt(String name, int fallback)` method supports default values.

```java
int keySize = androidOptions.optInt("keySize", 256);
int authValidityDuration = androidOptions.optInt("authenticationValidityDuration", -1);
```

**Similar Methods:**
| Method | Supports Default? | Use Instead |
|--------|------------------|-------------|
| `getInt(key)` | No | `optInt(key, default)` |
| `getString(key)` | No | `optString(key, default)` |
| `getBoolean(key)` | No | `optBoolean(key, default)` |
| `getLong(key)` | No | `optLong(key, default)` |
| `getDouble(key)` | No | `optDouble(key, default)` |

**Files Affected:**
- `android/src/main/java/com/aoneahsan/capacitor/biometricauth/BiometricAuthPlugin.java`

**Lesson Learned:**
When porting TypeScript/JavaScript code patterns to Java for Android, remember that Java's JSONObject API is different. Always use `opt*` methods when you need default values.

---

### 2. Keystore File Not Found for Signing

**Date:** 2025-12-11
**Severity:** Configuration Error

**Error Message:**
```
> Task :app:validateSigningRelease FAILED
Execution failed for task ':app:validateSigningRelease'.
> Keystore file '/path/to/keystore.jks' not found for signing config 'externalOverride'.
```

**Cause:**
The signing configuration in `android/app/build.gradle` references a keystore file that doesn't exist at the specified path.

**Fix Options:**
1. Place the keystore file at the expected path
2. Update `android/app/build.gradle` signing config to point to correct path
3. Use environment variables for keystore path:

```gradle
android {
    signingConfigs {
        release {
            storeFile file(System.getenv("KEYSTORE_PATH") ?: "default-keystore.jks")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
}
```

**Lesson Learned:**
Never hardcode absolute paths for keystores. Use environment variables or relative paths within the project.

---

## iOS Build Errors

### 1. Method Not Exposed in Objective-C Bridge

**Date:** 2025-12-11
**Version:** 2.1.0
**Severity:** Critical (Runtime Failure)

**Error Message:**
Method exists in Swift but not callable from JavaScript/TypeScript.

**Cause:**
Swift methods must be explicitly exposed to Objective-C using the `@objc` attribute for Capacitor plugins.

**Wrong Code:**
```swift
func register(_ call: CAPPluginCall) {
    // implementation
}
```

**Fix:**
```swift
@objc func register(_ call: CAPPluginCall) {
    // implementation
}
```

**Lesson Learned:**
All plugin methods in iOS must have the `@objc` attribute to be callable from the JavaScript bridge.

---

## Web/TypeScript Errors

*(No errors documented yet)*

---

## Capacitor Runtime Errors

### 1. Plugin Already Registered / .then() Not Implemented

**Date:** 2025-12-12
**Version:** 2.1.1 → 2.1.2
**Severity:** Critical (Runtime Failure)

**Error Messages:**
```
Capacitor plugin "BiometricAuth" already registered. Cannot register plugins twice.

Uncaught (in promise) Error: "BiometricAuth.then()" is not implemented on android
```

**Cause:**
The JavaScript code in the package was trying to register a Capacitor plugin with `registerPlugin('BiometricAuth', ...)` on ALL platforms. However, on Android and iOS, the native plugin is already registered automatically by Capacitor. This caused:
1. "Already registered" warning when the JS tried to register over the native plugin
2. ".then() not implemented" error because the native plugin doesn't have a `.then()` method (it's not a Promise)

**Wrong Code:**
```typescript
// src/index.ts - registering on all platforms
if (typeof window !== 'undefined') {
  const capacitorGlobal = (window as unknown as { Capacitor?: { registerPlugin?: ... } });
  if (capacitorGlobal.Capacitor?.registerPlugin) {
    // This runs on ALL platforms including Android/iOS - BAD!
    registerPlugin('BiometricAuth', { web: BiometricAuthPlugin });
  }
}
```

**Fix:**
Only register the plugin on web platform, skip on native platforms:

```typescript
// src/index.ts - only register on web
if (typeof window !== 'undefined') {
  const capacitorGlobal = (window as unknown as {
    Capacitor?: {
      registerPlugin?: (name: string, options: unknown) => void;
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
      Plugins?: Record<string, unknown>;
    }
  });

  // Skip registration on native platforms
  const isNative = capacitorGlobal.Capacitor?.isNativePlatform?.() ?? false;
  const platform = capacitorGlobal.Capacitor?.getPlatform?.() ?? 'web';
  const alreadyRegistered = capacitorGlobal.Capacitor?.Plugins?.['BiometricAuth'] !== undefined;

  if (!isNative && platform === 'web' && !alreadyRegistered && capacitorGlobal.Capacitor?.registerPlugin) {
    // Only register for web
    registerPlugin('BiometricAuth', { web: BiometricAuthPlugin });
  }
}
```

**Files Affected:**
- `src/index.ts`

**Lesson Learned:**
When creating Capacitor plugins with both native (Android/iOS) and web implementations:
1. Native platforms register plugins automatically - don't try to re-register from JS
2. Use `Capacitor.isNativePlatform()` and `Capacitor.getPlatform()` to detect platform
3. Only register web fallbacks when actually running on web
4. Check `Capacitor.Plugins` to see if plugin is already registered

---

## Capacitor Sync Errors

*(No errors documented yet)*

---

## Contributing to This Document

When you encounter a new error:

1. Add it under the appropriate category
2. Include:
   - Date encountered
   - Version affected
   - Severity level
   - Full error message
   - Root cause
   - Wrong code example
   - Correct code example
   - Files affected
   - Lesson learned

---

**Last Updated:** 2025-12-12

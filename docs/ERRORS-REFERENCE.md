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

**Last Updated:** 2025-12-11

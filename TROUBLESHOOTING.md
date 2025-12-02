# Troubleshooting Guide

This guide addresses common build failures and integration issues when using `capacitor-biometric-authentication` in production Capacitor apps.

## Table of Contents

- [Android Build Failures](#android-build-failures)
- [iOS Build Failures](#ios-build-failures)
- [Web Integration Issues](#web-integration-issues)
- [Plugin Registration Issues](#plugin-registration-issues)
- [Runtime Errors](#runtime-errors)

---

## Android Build Failures

### 1. Gradle Version Mismatch

**Symptoms:**
```
Could not find method namespace() for arguments [com.aoneahsan.capacitor.biometricauth]
```
or
```
Unsupported Gradle version. Required: 8.x, Found: 7.x
```

**Cause:** The plugin uses `namespace` property which requires Android Gradle Plugin 7.0+ and Gradle 8.0+.

**Fix:**
1. Update your project's `android/gradle/wrapper/gradle-wrapper.properties`:
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.7-all.zip
```

2. Update `android/build.gradle` (project-level):
```groovy
buildscript {
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
    }
}
```

3. Sync Gradle and rebuild.

---

### 2. Missing AndroidX Biometric Dependency

**Symptoms:**
```
error: cannot find symbol
import androidx.biometric.BiometricPrompt;
```
or
```
Class 'BiometricPrompt' not found
```

**Cause:** The AndroidX biometric library is not available in the build.

**Fix:**
The plugin includes `androidx.biometric:biometric:1.1.0` as a dependency, but if your project has conflicting versions:

1. Check your app's `android/app/build.gradle` for version conflicts
2. If needed, force a consistent version in your app's `android/build.gradle`:
```groovy
allprojects {
    configurations.all {
        resolutionStrategy.force 'androidx.biometric:biometric:1.1.0'
    }
}
```

---

### 3. minSdkVersion Too Low

**Symptoms:**
```
Manifest merger failed: uses-sdk:minSdkVersion 21 cannot be smaller than version 23 declared in library
```

**Cause:** This plugin requires Android 6.0 (API 23) minimum for biometric APIs.

**Fix:**
Update your app's `android/app/build.gradle`:
```groovy
android {
    defaultConfig {
        minSdkVersion 23  // Must be 23 or higher
    }
}
```

---

### 4. Java 17 Compatibility Error

**Symptoms:**
```
Execution failed for task ':capacitor-biometric-authentication:compileDebugJavaWithJavac'.
> Could not target platform: 'Java SE 17' using tool chain: 'JDK 11'
```

**Cause:** The plugin requires Java 17 (standard for Capacitor 6+/7+).

**Fix:**
1. Install JDK 17 (e.g., via Adoptium or Android Studio's embedded JDK)
2. Update your `android/app/build.gradle`:
```groovy
android {
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}
```

3. Ensure Android Studio uses JDK 17:
   - Go to **File > Project Structure > SDK Location**
   - Set **JDK Location** to JDK 17

---

### 5. Plugin Class Not Found

**Symptoms:**
```
Plugin class com.aoneahsan.capacitor.biometricauth.BiometricAuthPlugin not found
```

**Cause:** Plugin not properly synced or registered.

**Fix:**
1. Run `npx cap sync android`
2. Verify plugin is listed in `android/capacitor.settings.gradle`:
```groovy
include ':capacitor-biometric-authentication'
project(':capacitor-biometric-authentication').projectDir = new File('../node_modules/capacitor-biometric-authentication/android')
```

3. Clean and rebuild:
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

---

### 6. ProGuard/R8 Stripping Plugin Code

**Symptoms:**
- Plugin methods return unexpected errors in release builds
- "No such method" errors only in release APK

**Cause:** ProGuard/R8 is obfuscating or removing plugin classes.

**Fix:**
Add to your app's `android/app/proguard-rules.pro`:
```proguard
# Keep BiometricAuth plugin
-keep class com.aoneahsan.capacitor.biometricauth.** { *; }
```

---

### 7. USE_BIOMETRIC Permission Missing

**Symptoms:**
```
SecurityException: Permission Denial: requires android.permission.USE_BIOMETRIC
```

**Cause:** While the plugin declares this permission, manifest merging may fail.

**Fix:**
Add to your app's `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

---

## iOS Build Failures

### 1. Missing NSFaceIDUsageDescription

**Symptoms:**
```
This app has crashed because it attempted to access Face ID without usage description
```
or the app crashes immediately when calling `authenticate()` on Face ID devices.

**Cause:** iOS requires a privacy usage description for Face ID.

**Fix:**
Add to your app's `ios/App/App/Info.plist`:
```xml
<key>NSFaceIDUsageDescription</key>
<string>We use Face ID to securely authenticate you</string>
```

---

### 2. Pod Install Failures

**Symptoms:**
```
[!] Unable to find a specification for 'CapacitorBiometricAuthentication'
```
or
```
[!] CocoaPods could not find compatible versions for pod "CapacitorBiometricAuthentication"
```

**Cause:** Pod cache is stale or plugin not properly synced.

**Fix:**
```bash
# From project root
npx cap sync ios

# Then from ios directory
cd ios
pod deintegrate
pod cache clean --all
pod install --repo-update
```

---

### 3. Deployment Target Mismatch

**Symptoms:**
```
The iOS deployment target 'IPHONEOS_DEPLOYMENT_TARGET' is set to 11.0, but the range of supported deployment target versions is 12.0 to 17.0
```

**Cause:** The plugin requires iOS 13.0 minimum.

**Fix:**
1. Update your app's `ios/App/Podfile`:
```ruby
platform :ios, '13.0'
```

2. Update Xcode project deployment target to 13.0 or higher

3. Run:
```bash
cd ios
pod install
```

---

### 4. LocalAuthentication Framework Not Linked

**Symptoms:**
```
Undefined symbol: _LAContextClass
```
or
```
ld: framework not found LocalAuthentication
```

**Cause:** Required frameworks not linked.

**Fix:**
The plugin's podspec includes required frameworks, but if linking fails:
1. Open Xcode
2. Select your app target
3. Go to **Build Phases > Link Binary With Libraries**
4. Add:
   - `LocalAuthentication.framework`
   - `Security.framework`

---

### 5. Swift Version Mismatch

**Symptoms:**
```
Module compiled with Swift 5.7 cannot be imported by the Swift 5.9 compiler
```

**Cause:** Swift version mismatch between plugin and app.

**Fix:**
Add to your `ios/App/Podfile`:
```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['SWIFT_VERSION'] = '5.0'
    end
  end
end
```

---

### 6. Bridging Header Issues

**Symptoms:**
```
'BiometricAuthPlugin-Swift.h' file not found
```
or
```
Failed to emit precompiled header for bridging header
```

**Cause:** Module import issues with the plugin.

**Fix:**
1. Clean build folder in Xcode (Shift+Cmd+K)
2. Delete DerivedData:
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
```
3. Reinstall pods:
```bash
cd ios
pod deintegrate
pod install
```

---

### 7. Plugin Not Registered

**Symptoms:**
```
⚡️  To Native ->  BiometricAuth isAvailable
⚡️  ERROR: Plugin BiometricAuth not found
```

**Cause:** Plugin not properly registered in Capacitor.

**Fix:**
1. Verify sync was successful:
```bash
npx cap sync ios
```

2. Check that the plugin appears in the generated Podfile
3. Rebuild the iOS app in Xcode

---

## Web Integration Issues

### 1. WebAuthn Not Available

**Symptoms:**
```
BiometricAuth.isAvailable() returns false on web
```

**Cause:** WebAuthn requires:
- HTTPS (or localhost for development)
- A supported browser
- A platform authenticator (TouchID, Windows Hello, etc.)

**Fix:**
1. **For development:** Use `localhost` or `127.0.0.1` (not `0.0.0.0`)
2. **For production:** Ensure HTTPS is configured
3. **Check browser support:** Chrome 67+, Firefox 60+, Safari 14+, Edge 79+

---

### 2. HTTPS/Origin Errors

**Symptoms:**
```
SecurityError: The operation is insecure
```
or
```
NotAllowedError: The request is not allowed by the user agent or the platform
```

**Cause:** WebAuthn requires a secure context.

**Fix:**
- Use `https://` for production
- For local development, use:
  - `http://localhost:3000` (works)
  - `http://127.0.0.1:3000` (works)
  - `http://192.168.x.x:3000` (does NOT work - needs HTTPS)

To enable HTTPS in Vite development:
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    https: true,
  },
});
```

---

### 3. Module Resolution Errors

**Symptoms:**
```
Cannot find module 'capacitor-biometric-authentication'
```
or
```
Module not found: Error: Can't resolve '@capacitor/core'
```

**Cause:** Package not installed or bundler configuration issue.

**Fix:**
1. Ensure the package is installed:
```bash
npm install capacitor-biometric-authentication
```

2. Check your bundler can resolve ESM modules
3. If using TypeScript, ensure `moduleResolution` is `node16` or `bundler`:
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

---

## Plugin Registration Issues

### 1. "Plugin not implemented" Error

**Symptoms:**
```
Plugin 'BiometricAuth' is not implemented on web
```

**Cause:** The web adapter failed to load.

**Fix:**
This plugin uses dynamic adapter loading. Ensure you're importing correctly:
```typescript
// Correct - uses framework-agnostic API
import BiometricAuth from 'capacitor-biometric-authentication';

// NOT the Capacitor plugin API directly
// import { BiometricAuth } from 'capacitor-biometric-authentication';
```

---

### 2. Multiple Plugin Instances

**Symptoms:**
- Authentication state not persisting
- Duplicate authentication prompts

**Cause:** Plugin being instantiated multiple times.

**Fix:**
The plugin uses a singleton pattern. Always import the default export:
```typescript
// Correct - uses singleton
import BiometricAuth from 'capacitor-biometric-authentication';

// Avoid creating new instances
```

---

## Runtime Errors

### 1. Authentication Immediately Fails

**Symptoms:**
- `authenticate()` returns `{ success: false }` immediately
- No biometric prompt appears

**Cause:** Usually indicates biometrics not enrolled or not available.

**Diagnosis:**
```typescript
const available = await BiometricAuth.isAvailable();
const types = await BiometricAuth.getSupportedBiometrics();
console.log('Available:', available, 'Types:', types);
```

**Fix:**
- Ensure biometrics are enrolled on the device
- Check device settings for biometric configuration
- On Android, ensure the device has a secure lock screen

---

### 2. Session Expires Too Quickly

**Symptoms:**
- `isAuthenticated()` returns `false` shortly after authentication
- Users need to re-authenticate frequently

**Cause:** Session duration configuration.

**Fix:**
Configure a longer session duration (in seconds):
```typescript
BiometricAuth.configure({
  sessionDuration: 3600, // 1 hour in seconds
});
```

---

### 3. Credentials Not Persisting

**Symptoms:**
- App asks for biometric setup on every launch
- `hasCredentials()` always returns `false`

**Cause:** Credentials stored in memory only or storage being cleared.

**Fix:**
- Ensure you're calling `authenticate()` with `saveCredentials: true`
- Check that app data isn't being cleared between launches
- On iOS, ensure Keychain entitlements are configured (usually automatic with Capacitor)

---

## Diagnostic Commands

### Check Plugin Installation
```bash
# List installed Capacitor plugins
npx cap ls

# Verify plugin sync status
npx cap sync --inline
```

### Android Diagnostics
```bash
# Clean and rebuild
cd android && ./gradlew clean && cd ..
npx cap sync android
npx cap open android
```

### iOS Diagnostics
```bash
# Reset pods and rebuild
cd ios
pod deintegrate
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
npx cap sync ios
npx cap open ios
```

### Web Diagnostics
```javascript
// Browser console
console.log('WebAuthn available:', !!window.PublicKeyCredential);
if (window.PublicKeyCredential) {
  PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    .then(available => console.log('Platform authenticator:', available));
}
```

---

## Getting Help

If you're still experiencing issues:

1. **Check the [GitHub Issues](https://github.com/aoneahsan/capacitor-biometric-authentication/issues)** for similar problems
2. **Open a new issue** with:
   - Your environment (OS, Node version, Capacitor version)
   - Full error message and stack trace
   - Steps to reproduce
   - Relevant configuration files

3. **Contact the maintainer:** aoneahsan@gmail.com

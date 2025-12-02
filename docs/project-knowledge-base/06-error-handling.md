# Error Handling

**Last Updated:** 2025-12-02

## Error Codes

### BiometricErrorCode

| Code | Value | Description | User Action |
|------|-------|-------------|-------------|
| AUTHENTICATION_FAILED | authenticationFailed | Biometric not recognized | Retry or use fallback |
| USER_CANCELLED | userCancelled | User cancelled operation | Show alternative |
| SYSTEM_CANCELLED | systemCancelled | System interrupted (call, low memory) | Retry automatically |
| NOT_AVAILABLE | notAvailable | Biometrics not available | Use fallback auth |
| PERMISSION_DENIED | permissionDenied | App lacks permission | Request permission |
| LOCKED_OUT | lockedOut | Too many failed attempts | Wait or use passcode |
| INVALID_CONTEXT | invalidContext | Invalid auth context | Reinitialize |
| NOT_ENROLLED | notEnrolled | No biometric data enrolled | Prompt enrollment |
| TIMEOUT | timeout | Operation timed out | Retry |
| UNKNOWN | unknown | Unknown error | Log and retry |

---

## Unavailability Reasons

### BiometricUnavailableReason

| Reason | Value | Cause | Resolution |
|--------|-------|-------|------------|
| NO_HARDWARE | noHardware | Device lacks biometric sensor | Use alternative auth |
| HARDWARE_UNAVAILABLE | hardwareUnavailable | Sensor temporarily unavailable | Retry later |
| NO_ENROLLED_BIOMETRICS | noEnrolledBiometrics | User hasn't enrolled biometrics | Prompt to enroll |
| PERMISSION_DENIED | permissionDenied | Missing app permission | Request permission |
| NOT_SUPPORTED | notSupported | Platform doesn't support | Use alternative auth |
| LOCKED_OUT | lockedOut | Biometric lockout active | Wait for timeout |
| USER_DISABLED | userDisabled | User disabled biometrics | Respect preference |

---

## Platform-Specific Errors

### Web (WebAuthn)

| Error Name | Mapped Code | Cause |
|------------|-------------|-------|
| NotAllowedError | userCancelled | User denied or cancelled |
| NotSupportedError | notAvailable | WebAuthn not supported |
| InvalidStateError | invalidContext | Invalid credential state |
| SecurityError | invalidContext | Security requirements not met |
| AbortError | systemCancelled | Operation aborted |
| ConstraintError | authenticationFailed | Constraint not satisfied |

### iOS (LocalAuthentication)

| LAError | Mapped Code | Cause |
|---------|-------------|-------|
| userCancel | userCancelled | User tapped Cancel |
| userFallback | userCancelled | User chose fallback |
| systemCancel | systemCancelled | System cancelled (call, etc.) |
| authenticationFailed | authenticationFailed | Biometric not matched |
| biometryLockout | lockedOut | Too many failures |
| biometryNotAvailable | notAvailable | Biometry not available |
| biometryNotEnrolled | notEnrolled | No biometrics enrolled |
| passcodeNotSet | notAvailable | Device passcode not set |
| appCancel | systemCancelled | App cancelled |
| invalidContext | invalidContext | Context invalidated |
| notInteractive | invalidContext | Non-interactive context |

### Android (BiometricPrompt)

| Error Constant | Mapped Code | Cause |
|----------------|-------------|-------|
| ERROR_HW_UNAVAILABLE | notAvailable | Hardware unavailable |
| ERROR_UNABLE_TO_PROCESS | authenticationFailed | Sensor error |
| ERROR_TIMEOUT | timeout | Auth timed out |
| ERROR_NO_SPACE | unknown | No storage space |
| ERROR_CANCELED | systemCancelled | Operation cancelled |
| ERROR_LOCKOUT | lockedOut | Temporary lockout (30s) |
| ERROR_LOCKOUT_PERMANENT | lockedOut | Permanent lockout |
| ERROR_USER_CANCELED | userCancelled | User cancelled |
| ERROR_NO_BIOMETRICS | notEnrolled | No biometrics enrolled |
| ERROR_HW_NOT_PRESENT | notAvailable | No biometric hardware |
| ERROR_NEGATIVE_BUTTON | userCancelled | Negative button pressed |
| ERROR_NO_DEVICE_CREDENTIAL | notAvailable | No device credential |
| ERROR_VENDOR | unknown | Vendor-specific error |

---

## Error Handling Patterns

### Basic Error Handling

```typescript
const result = await BiometricAuth.authenticate();

if (!result.success) {
  switch (result.error?.code) {
    case 'userCancelled':
      // User cancelled - show alternative
      showPasswordLogin();
      break;

    case 'authenticationFailed':
      // Biometric didn't match
      showRetryPrompt();
      break;

    case 'notAvailable':
    case 'notEnrolled':
      // Biometrics not available
      showPasswordLogin();
      break;

    case 'lockedOut':
      // Too many attempts
      showLockoutMessage(result.error.message);
      break;

    default:
      // Unknown error
      console.error('Auth error:', result.error);
      showGenericError();
  }
}
```

### Availability Check First

```typescript
async function authenticateUser() {
  // Check availability first
  const available = await BiometricAuth.isAvailable();

  if (!available) {
    // Fall back to password
    return passwordAuth();
  }

  // Proceed with biometric
  const result = await BiometricAuth.authenticate();

  if (result.success) {
    return { authenticated: true, token: result.token };
  }

  // Handle specific errors
  if (result.error?.code === 'userCancelled') {
    return { authenticated: false, cancelled: true };
  }

  // Other errors - try password
  return passwordAuth();
}
```

### Retry Logic

```typescript
async function authenticateWithRetry(maxRetries = 3) {
  let attempts = 0;

  while (attempts < maxRetries) {
    const result = await BiometricAuth.authenticate();

    if (result.success) {
      return result;
    }

    // Don't retry these errors
    if (['userCancelled', 'lockedOut', 'notAvailable'].includes(result.error?.code)) {
      return result;
    }

    attempts++;

    // Wait before retry
    if (attempts < maxRetries) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  return { success: false, error: { code: 'maxRetriesExceeded', message: 'Max retries exceeded' } };
}
```

### Error Recovery

```typescript
async function handleBiometricError(error: BiometricAuthError) {
  switch (error.code) {
    case 'lockedOut':
      // Show countdown timer
      return showLockoutUI(30); // 30 second lockout

    case 'notEnrolled':
      // Prompt user to enroll
      return promptBiometricEnrollment();

    case 'permissionDenied':
      // Request permission
      return requestBiometricPermission();

    case 'systemCancelled':
      // Auto-retry after delay
      await delay(500);
      return BiometricAuth.authenticate();

    default:
      // Log for debugging
      console.error('Biometric error:', error);
      return showFallbackAuth();
  }
}
```

---

## Error Response Structure

### BiometricAuthResult (Error Case)

```typescript
{
  success: false,
  error: {
    code: 'authenticationFailed',
    message: 'Biometric authentication failed',
    details: {
      // Platform-specific details
      nativeError: 'ERROR_UNABLE_TO_PROCESS',
      attempts: 2
    }
  }
}
```

### BiometricAvailabilityResult (Unavailable)

```typescript
{
  available: false,
  reason: 'noEnrolledBiometrics',
  errorMessage: 'No biometric data enrolled on this device'
}
```

---

## Lockout Behavior

### Temporary Lockout

| Platform | Threshold | Duration |
|----------|-----------|----------|
| iOS | 5 failures | 30 seconds |
| Android | 5 failures | 30 seconds |
| Web | N/A | Browser-dependent |

### Permanent Lockout

| Platform | Trigger | Resolution |
|----------|---------|------------|
| iOS | Multiple temp lockouts | Device passcode required |
| Android | Multiple temp lockouts | Device credential required |

---

## Best Practices

1. **Always check availability** before attempting authentication
2. **Handle userCancelled gracefully** - it's a valid user choice
3. **Provide fallback authentication** for all error cases
4. **Log unknown errors** for debugging
5. **Don't retry on userCancelled or lockedOut**
6. **Show meaningful messages** for each error type
7. **Respect lockout periods** - don't circumvent
8. **Test error scenarios** on real devices

/**
 * Unified encoding utilities for biometric authentication
 *
 * This module consolidates base64/base64url encoding functions
 * that were previously duplicated across multiple files.
 */

/**
 * Convert ArrayBuffer to standard base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert ArrayBuffer to base64url string (WebAuthn standard)
 * Base64url is URL-safe: uses - instead of +, _ instead of /, no padding
 */
export function arrayBufferToBase64URL(buffer: ArrayBuffer): string {
  return arrayBufferToBase64(buffer)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Convert base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Convert base64url string to ArrayBuffer
 */
export function base64URLToArrayBuffer(base64url: string): ArrayBuffer {
  // Convert base64url to standard base64
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding if necessary
  const paddingNeeded = (4 - (base64.length % 4)) % 4;
  base64 = base64.padEnd(base64.length + paddingNeeded, '=');

  return base64ToArrayBuffer(base64);
}

/**
 * Convert Uint8Array to base64url string
 */
export function uint8ArrayToBase64URL(array: Uint8Array): string {
  // Create a new ArrayBuffer to avoid SharedArrayBuffer issues
  const buffer = new ArrayBuffer(array.byteLength);
  new Uint8Array(buffer).set(array);
  return arrayBufferToBase64URL(buffer);
}

/**
 * Convert base64url string to Uint8Array
 */
export function base64URLToUint8Array(base64url: string): Uint8Array {
  return new Uint8Array(base64URLToArrayBuffer(base64url));
}

/**
 * Convert various input formats to ArrayBuffer
 * Handles ArrayBuffer, Uint8Array, base64, base64url, and UTF-8 strings
 */
export function toArrayBuffer(
  data: ArrayBuffer | Uint8Array | string | undefined,
): ArrayBuffer | undefined {
  if (!data) return undefined;

  if (data instanceof ArrayBuffer) {
    return data;
  }

  if (data instanceof Uint8Array) {
    const buffer = data.buffer as ArrayBuffer;
    return buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  }

  if (typeof data === 'string') {
    // Try base64url first (WebAuthn standard)
    try {
      return base64URLToArrayBuffer(data);
    } catch {
      // Try standard base64
      try {
        return base64ToArrayBuffer(data);
      } catch {
        // Fallback to UTF-8 encoding
        return new TextEncoder().encode(data).buffer;
      }
    }
  }

  return undefined;
}

/**
 * Generate a cryptographically secure random session ID
 */
export function generateSessionId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return arrayBufferToBase64URL(array.buffer);
}

/**
 * Generate a cryptographically secure random challenge
 */
export function generateChallenge(length: number = 32): ArrayBuffer {
  const challenge = new Uint8Array(length);
  crypto.getRandomValues(challenge);
  return challenge.buffer;
}

/**
 * Check if a string is valid base64url
 */
export function isBase64URL(str: string): boolean {
  return /^[A-Za-z0-9_-]*$/.test(str);
}

/**
 * Check if a string is valid base64
 */
export function isBase64(str: string): boolean {
  return /^[A-Za-z0-9+/]*={0,2}$/.test(str);
}

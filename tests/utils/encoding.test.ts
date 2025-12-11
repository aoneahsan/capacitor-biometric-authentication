import { describe, it, expect } from 'vitest';
import {
  arrayBufferToBase64,
  arrayBufferToBase64URL,
  base64ToArrayBuffer,
  base64URLToArrayBuffer,
  uint8ArrayToBase64URL,
  base64URLToUint8Array,
  toArrayBuffer,
  generateSessionId,
  generateChallenge,
  isBase64URL,
  isBase64,
} from '../../src/utils/encoding';

describe('Encoding Utilities', () => {
  describe('arrayBufferToBase64', () => {
    it('should convert ArrayBuffer to base64', () => {
      const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer; // "Hello"
      const result = arrayBufferToBase64(buffer);
      expect(result).toBe('SGVsbG8=');
    });

    it('should handle empty buffer', () => {
      const buffer = new Uint8Array([]).buffer;
      const result = arrayBufferToBase64(buffer);
      expect(result).toBe('');
    });

    it('should handle binary data', () => {
      const buffer = new Uint8Array([0, 127, 255]).buffer;
      const result = arrayBufferToBase64(buffer);
      expect(result).toBe('AH//');
    });
  });

  describe('arrayBufferToBase64URL', () => {
    it('should convert ArrayBuffer to base64url', () => {
      const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer;
      const result = arrayBufferToBase64URL(buffer);
      // Should not have padding
      expect(result).toBe('SGVsbG8');
      expect(result).not.toContain('=');
    });

    it('should replace + with - and / with _', () => {
      // Test data that produces + in base64: bytes that create 111110 111011 binary pattern
      const bufferWithPlus = new Uint8Array([251, 239, 190]).buffer;
      const base64Plus = arrayBufferToBase64(bufferWithPlus);
      const base64urlPlus = arrayBufferToBase64URL(bufferWithPlus);

      expect(base64Plus).toContain('+');
      expect(base64urlPlus).not.toContain('+');
      expect(base64urlPlus).toContain('-');

      // Test data that produces / in base64: bytes 0xFF creates '/' when split across boundaries
      const bufferWithSlash = new Uint8Array([255, 255, 255]).buffer;
      const base64Slash = arrayBufferToBase64(bufferWithSlash);
      const base64urlSlash = arrayBufferToBase64URL(bufferWithSlash);

      expect(base64Slash).toContain('/');
      expect(base64urlSlash).not.toContain('/');
      expect(base64urlSlash).toContain('_');
    });
  });

  describe('base64ToArrayBuffer', () => {
    it('should convert base64 to ArrayBuffer', () => {
      const base64 = 'SGVsbG8=';
      const result = base64ToArrayBuffer(base64);
      const expected = new Uint8Array([72, 101, 108, 108, 111]);
      expect(new Uint8Array(result)).toEqual(expected);
    });

    it('should handle empty string', () => {
      const result = base64ToArrayBuffer('');
      expect(result.byteLength).toBe(0);
    });
  });

  describe('base64URLToArrayBuffer', () => {
    it('should convert base64url to ArrayBuffer', () => {
      const base64url = 'SGVsbG8'; // Without padding
      const result = base64URLToArrayBuffer(base64url);
      const expected = new Uint8Array([72, 101, 108, 108, 111]);
      expect(new Uint8Array(result)).toEqual(expected);
    });

    it('should handle base64url with replaced characters', () => {
      // Original base64: ++//
      // Base64URL: --__
      const base64url = '--__';
      const result = base64URLToArrayBuffer(base64url);
      const backToBase64url = arrayBufferToBase64URL(result);
      expect(backToBase64url).toBe('--__');
    });

    it('should add padding correctly', () => {
      // Test with different padding requirements
      const testCases = [
        'YQ', // needs 2 padding
        'YWI', // needs 1 padding
        'YWJj', // no padding needed
      ];

      for (const input of testCases) {
        expect(() => base64URLToArrayBuffer(input)).not.toThrow();
      }
    });
  });

  describe('uint8ArrayToBase64URL and base64URLToUint8Array', () => {
    it('should round-trip Uint8Array', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5]);
      const base64url = uint8ArrayToBase64URL(original);
      const result = base64URLToUint8Array(base64url);
      expect(result).toEqual(original);
    });

    it('should handle typed array with offset', () => {
      const buffer = new ArrayBuffer(10);
      const view = new Uint8Array(buffer, 2, 5);
      view.set([10, 20, 30, 40, 50]);

      const base64url = uint8ArrayToBase64URL(view);
      const result = base64URLToUint8Array(base64url);
      expect(result).toEqual(new Uint8Array([10, 20, 30, 40, 50]));
    });
  });

  describe('toArrayBuffer', () => {
    it('should return undefined for undefined input', () => {
      expect(toArrayBuffer(undefined)).toBeUndefined();
    });

    it('should pass through ArrayBuffer', () => {
      const buffer = new ArrayBuffer(10);
      const result = toArrayBuffer(buffer);
      expect(result).toBe(buffer);
    });

    it('should convert Uint8Array to ArrayBuffer', () => {
      const array = new Uint8Array([1, 2, 3]);
      const result = toArrayBuffer(array);
      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(new Uint8Array(result!)).toEqual(array);
    });

    it('should convert base64url string to ArrayBuffer', () => {
      const base64url = 'SGVsbG8';
      const result = toArrayBuffer(base64url);
      expect(result).toBeInstanceOf(ArrayBuffer);
      const text = new TextDecoder().decode(result!);
      expect(text).toBe('Hello');
    });

    it('should fallback to UTF-8 for non-base64 strings', () => {
      const text = '日本語'; // Japanese characters - not valid base64
      const result = toArrayBuffer(text);
      // The result should be defined (either as parsed or UTF-8 encoded)
      expect(result).toBeDefined();
      // Verify it has content
      expect(result!.byteLength).toBeGreaterThan(0);
    });
  });

  describe('generateSessionId', () => {
    it('should generate a string', () => {
      const sessionId = generateSessionId();
      expect(typeof sessionId).toBe('string');
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateSessionId());
      }
      expect(ids.size).toBe(100);
    });

    it('should be valid base64url', () => {
      const sessionId = generateSessionId();
      expect(isBase64URL(sessionId)).toBe(true);
    });
  });

  describe('generateChallenge', () => {
    it('should generate ArrayBuffer of default length', () => {
      const challenge = generateChallenge();
      expect(challenge).toBeInstanceOf(ArrayBuffer);
      expect(challenge.byteLength).toBe(32);
    });

    it('should generate ArrayBuffer of specified length', () => {
      const challenge = generateChallenge(64);
      expect(challenge.byteLength).toBe(64);
    });

    it('should generate unique challenges', () => {
      const challenges = new Set<string>();
      for (let i = 0; i < 100; i++) {
        challenges.add(arrayBufferToBase64URL(generateChallenge()));
      }
      expect(challenges.size).toBe(100);
    });
  });

  describe('isBase64URL', () => {
    it('should return true for valid base64url', () => {
      expect(isBase64URL('SGVsbG8')).toBe(true);
      expect(isBase64URL('abc123-_')).toBe(true);
      expect(isBase64URL('')).toBe(true);
    });

    it('should return false for invalid base64url', () => {
      expect(isBase64URL('Hello=')).toBe(false); // Has padding
      expect(isBase64URL('Hello+')).toBe(false); // Has +
      expect(isBase64URL('Hello/')).toBe(false); // Has /
    });
  });

  describe('isBase64', () => {
    it('should return true for valid base64', () => {
      expect(isBase64('SGVsbG8=')).toBe(true);
      expect(isBase64('abc123+/')).toBe(true);
      expect(isBase64('')).toBe(true);
    });

    it('should return false for invalid base64', () => {
      expect(isBase64('Hello-')).toBe(false); // Has -
      expect(isBase64('Hello_')).toBe(false); // Has _
    });
  });

  describe('round-trip conversions', () => {
    it('should round-trip ArrayBuffer through base64', () => {
      const original = crypto.getRandomValues(new Uint8Array(32)).buffer;
      const base64 = arrayBufferToBase64(original);
      const result = base64ToArrayBuffer(base64);
      expect(new Uint8Array(result)).toEqual(new Uint8Array(original));
    });

    it('should round-trip ArrayBuffer through base64url', () => {
      const original = crypto.getRandomValues(new Uint8Array(32)).buffer;
      const base64url = arrayBufferToBase64URL(original);
      const result = base64URLToArrayBuffer(base64url);
      expect(new Uint8Array(result)).toEqual(new Uint8Array(original));
    });
  });
});

import { SignJWT, jwtDecrypt } from 'jose';

import {
  hexToUint8Array,
  toHex,
  encrypt,
  decrypt,
  createEncryptedJWT,
  sha256,
  sha512,
  generateToken,
  accessTokenExpires,
  getSessionSecret,
  getSessionSecretUint8Array,
} from './utils';

/** 32-byte (256-bit) AES key — 64 hex characters */
const TEST_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const TEST_SECRET_BYTES = hexToUint8Array(TEST_SECRET);

/** Helper: create a signed JWT with optional expiration for accessTokenExpires tests */
async function createSignedJWT(
  claims: Record<string, unknown>,
  expirationTime?: string | number,
): Promise<string> {
  const key = new TextEncoder().encode('test-secret-at-least-32-bytes!!');
  let builder = new SignJWT(claims).setProtectedHeader({ alg: 'HS256' }).setIssuedAt();
  if (expirationTime !== undefined) {
    builder = builder.setExpirationTime(expirationTime);
  }
  return builder.sign(key);
}

// ────────────────────────────────────────────
// hexToUint8Array
// ────────────────────────────────────────────

describe('hexToUint8Array', () => {
  it('converts a valid hex string to Uint8Array', () => {
    expect(hexToUint8Array('aabbcc')).toEqual(new Uint8Array([0xaa, 0xbb, 0xcc]));
  });

  it('returns empty Uint8Array for empty string', () => {
    const result = hexToUint8Array('');
    expect(result).toEqual(new Uint8Array([]));
    expect(result.length).toBe(0);
  });

  it('handles 00 and ff boundary byte values', () => {
    expect(hexToUint8Array('00ff')).toEqual(new Uint8Array([0x00, 0xff]));
  });

  it('handles a full 32-byte key', () => {
    const result = hexToUint8Array(TEST_SECRET);
    expect(result.length).toBe(32);
    expect(result[0]).toBe(0x01);
  });

  it('throws on odd-length hex string', () => {
    expect(() => hexToUint8Array('abc')).toThrow('Invalid hex string');
  });
});

// ────────────────────────────────────────────
// toHex
// ────────────────────────────────────────────

describe('toHex', () => {
  it('converts Uint8Array to lowercase hex string', () => {
    expect(toHex(new Uint8Array([0xaa, 0xbb, 0xcc]))).toBe('aabbcc');
  });

  it('returns empty string for empty Uint8Array', () => {
    expect(toHex(new Uint8Array([]))).toBe('');
  });

  it('pads single-digit hex values with leading zero', () => {
    expect(toHex(new Uint8Array([0x00, 0x01, 0x0f]))).toBe('00010f');
  });

  it('round-trips with hexToUint8Array', () => {
    const hex = 'deadbeef01020304';
    expect(toHex(hexToUint8Array(hex))).toBe(hex);
  });
});

// ────────────────────────────────────────────
// encrypt / decrypt
// ────────────────────────────────────────────

describe('encrypt / decrypt', () => {
  it('round-trips: encrypt then decrypt returns original text', async () => {
    const plaintext = 'hello, world!';
    const encrypted = await encrypt(plaintext, TEST_SECRET);
    const decrypted = await decrypt(encrypted, TEST_SECRET);
    expect(decrypted).toBe(plaintext);
  });

  it('output format is iv:authTag:ciphertext (three colon-separated hex parts)', async () => {
    const encrypted = await encrypt('test', TEST_SECRET);
    const parts = encrypted.split(':');
    expect(parts).toHaveLength(3);

    for (const part of parts) {
      expect(part).toMatch(/^[0-9a-f]+$/);
    }

    // IV = 12 bytes = 24 hex chars
    expect(parts[0]).toHaveLength(24);
    // Auth tag = 16 bytes = 32 hex chars
    expect(parts[1]).toHaveLength(32);
  });

  it('different plaintexts produce different outputs', async () => {
    const a = await encrypt('alpha', TEST_SECRET);
    const b = await encrypt('bravo', TEST_SECRET);
    expect(a).not.toBe(b);
  });

  it('same plaintext encrypted twice produces different output (random IV)', async () => {
    const a = await encrypt('same', TEST_SECRET);
    const b = await encrypt('same', TEST_SECRET);
    expect(a).not.toBe(b);
  });

  it('wrong secret fails to decrypt', async () => {
    const encrypted = await encrypt('secret data', TEST_SECRET);
    const wrongSecret = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    await expect(decrypt(encrypted, wrongSecret)).rejects.toThrow();
  });

  it('accepts Uint8Array secret for encrypt and decrypt', async () => {
    const encrypted = await encrypt('hello', TEST_SECRET_BYTES);
    const decrypted = await decrypt(encrypted, TEST_SECRET_BYTES);
    expect(decrypted).toBe('hello');
  });

  it('string secret and equivalent Uint8Array secret are interchangeable', async () => {
    const encrypted = await encrypt('interop', TEST_SECRET);
    const decrypted = await decrypt(encrypted, TEST_SECRET_BYTES);
    expect(decrypted).toBe('interop');
  });

  it('encrypts empty string to valid format but decrypt rejects empty ciphertext', async () => {
    // AES-GCM with empty plaintext produces 0 bytes of ciphertext,
    // so the output is "iv:authTag:" — the empty trailing part is falsy
    // and decrypt() throws. This documents the current behaviour.
    const encrypted = await encrypt('', TEST_SECRET);
    const parts = encrypted.split(':');
    expect(parts).toHaveLength(3);
    expect(parts[2]).toBe(''); // empty ciphertext hex

    await expect(decrypt(encrypted, TEST_SECRET)).rejects.toThrow(
      'Invalid encrypted data format',
    );
  });

  it('handles special characters and unicode', async () => {
    const text = '🔐 Ønsk & <script>alert("xss")</script> — ñ 日本語';
    const encrypted = await encrypt(text, TEST_SECRET);
    const decrypted = await decrypt(encrypted, TEST_SECRET);
    expect(decrypted).toBe(text);
  });

  it('throws on invalid encrypted data format', async () => {
    await expect(decrypt('not-valid-format', TEST_SECRET)).rejects.toThrow(
      'Invalid encrypted data format',
    );
  });
});

// ────────────────────────────────────────────
// createEncryptedJWT
// ────────────────────────────────────────────

describe('createEncryptedJWT', () => {
  it('returns a JWE with 5 dot-separated parts', async () => {
    const jwe = await createEncryptedJWT({ sub: 'user-1' }, TEST_SECRET);
    expect(jwe.split('.')).toHaveLength(5);
  });

  it('round-trips with jwtDecrypt', async () => {
    const payload = { sub: 'user-42', name: 'Test' };
    const jwe = await createEncryptedJWT(payload, TEST_SECRET);
    const { payload: decoded } = await jwtDecrypt(jwe, TEST_SECRET_BYTES);
    expect(decoded.sub).toBe('user-42');
    expect(decoded.name).toBe('Test');
  });

  it('accepts string secret', async () => {
    const jwe = await createEncryptedJWT({ foo: 'bar' }, TEST_SECRET);
    const { payload } = await jwtDecrypt(jwe, TEST_SECRET_BYTES);
    expect(payload.foo).toBe('bar');
  });

  it('accepts Uint8Array secret', async () => {
    const jwe = await createEncryptedJWT({ foo: 'baz' }, TEST_SECRET_BYTES);
    const { payload } = await jwtDecrypt(jwe, TEST_SECRET_BYTES);
    expect(payload.foo).toBe('baz');
  });

  it('includes iat claim automatically', async () => {
    const jwe = await createEncryptedJWT({}, TEST_SECRET);
    const { payload } = await jwtDecrypt(jwe, TEST_SECRET_BYTES);
    expect(payload.iat).toBeTypeOf('number');
  });
});

// ────────────────────────────────────────────
// sha256
// ────────────────────────────────────────────

describe('sha256', () => {
  it('returns correct hash for known test vector ("hello")', async () => {
    const hash = await sha256('hello');
    expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  it('returns a 64-character lowercase hex string', async () => {
    const hash = await sha256('anything');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('accepts Uint8Array input', async () => {
    const input = new TextEncoder().encode('hello');
    const hash = await sha256(input);
    expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  it('returns different hashes for different inputs', async () => {
    const a = await sha256('a');
    const b = await sha256('b');
    expect(a).not.toBe(b);
  });
});

// ────────────────────────────────────────────
// sha512
// ────────────────────────────────────────────

describe('sha512', () => {
  it('returns correct hash for known test vector ("hello")', async () => {
    const hash = await sha512('hello');
    expect(hash).toBe(
      '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca7' +
      '2323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043',
    );
  });

  it('returns a 128-character lowercase hex string', async () => {
    const hash = await sha512('anything');
    expect(hash).toHaveLength(128);
    expect(hash).toMatch(/^[0-9a-f]{128}$/);
  });

  it('accepts Uint8Array input', async () => {
    const input = new TextEncoder().encode('hello');
    const hash = await sha512(input);
    expect(hash).toBe(
      '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca7' +
      '2323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043',
    );
  });
});

// ────────────────────────────────────────────
// generateToken
// ────────────────────────────────────────────

describe('generateToken', () => {
  it('returns a 64-char hex string by default (32 bytes)', () => {
    const token = generateToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('respects custom byte length', () => {
    const token = generateToken(16);
    // 16 bytes = 32 hex chars
    expect(token).toHaveLength(32);
    expect(token).toMatch(/^[0-9a-f]{32}$/);
  });

  it('two calls produce different tokens', () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).not.toBe(b);
  });
});

// ────────────────────────────────────────────
// accessTokenExpires
// ────────────────────────────────────────────

describe('accessTokenExpires', () => {
  it('returns true when token expires within default threshold', async () => {
    // Expires in 5 seconds, default threshold is 10 s → expires soon
    const token = await createSignedJWT({}, Math.floor(Date.now() / 1000) + 5);
    expect(accessTokenExpires(token)).toBe(true);
  });

  it('returns false when token is far from expiring', async () => {
    const token = await createSignedJWT({}, '1h');
    expect(accessTokenExpires(token)).toBe(false);
  });

  it('returns true for already-expired token', async () => {
    const token = await createSignedJWT({}, Math.floor(Date.now() / 1000) - 60);
    expect(accessTokenExpires(token)).toBe(true);
  });

  it('returns false when there is no exp claim', async () => {
    const token = await createSignedJWT({});
    expect(accessTokenExpires(token)).toBe(false);
  });

  it('respects custom seconds threshold', async () => {
    // Expires in 30 s — 10 s threshold → false, 60 s threshold → true
    const token = await createSignedJWT({}, Math.floor(Date.now() / 1000) + 30);
    expect(accessTokenExpires(token, 10)).toBe(false);
    expect(accessTokenExpires(token, 60)).toBe(true);
  });

  it('returns true for a malformed token', () => {
    expect(accessTokenExpires('not-a-valid-jwt')).toBe(true);
  });
});

// ────────────────────────────────────────────
// getSessionSecret / getSessionSecretUint8Array
// ────────────────────────────────────────────

describe('getSessionSecret', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns SESSION_SECRET from env', () => {
    vi.stubEnv('SESSION_SECRET', TEST_SECRET);
    expect(getSessionSecret()).toBe(TEST_SECRET);
  });

  it('throws when SESSION_SECRET is empty', () => {
    vi.stubEnv('SESSION_SECRET', '');
    expect(() => getSessionSecret()).toThrow('SESSION_SECRET is not defined');
  });
});

describe('getSessionSecretUint8Array', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns a Uint8Array derived from SESSION_SECRET', () => {
    vi.stubEnv('SESSION_SECRET', TEST_SECRET);
    const result = getSessionSecretUint8Array();
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(32); // 64 hex chars → 32 bytes
  });

  it('produces the same bytes as hexToUint8Array on the same secret', () => {
    vi.stubEnv('SESSION_SECRET', TEST_SECRET);
    const result = getSessionSecretUint8Array();
    const expected = hexToUint8Array(TEST_SECRET);
    expect(Array.from(result)).toEqual(Array.from(expected));
  });

  it('throws when SESSION_SECRET is not set', () => {
    vi.stubEnv('SESSION_SECRET', '');
    expect(() => getSessionSecretUint8Array()).toThrow('SESSION_SECRET is not defined');
  });
});

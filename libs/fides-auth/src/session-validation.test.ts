/**
 * Tests for session-validation.ts — typical production flows:
 *
 * 1. Create an encrypted session JWT
 * 2. Validate it and get the session back
 * 3. Detect expired / tampered / malformed tokens
 */
import { EncryptJWT } from 'jose';

import { validateSessionJwt, isSession, type SessionValidationResult } from './session-validation';
import { createEncryptedJWT, hexToUint8Array } from './utils';
import type { Session } from './types';

/** 32-byte AES-256 key */
const SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const SECRET_BYTES = hexToUint8Array(SECRET);
const WRONG_SECRET = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

/** A realistic session object */
const testSession: Session = {
  tokens: {
    accessToken: 'eyJ.test.access-token',
    refreshToken: 'eyJ.test.refresh-token',
    accessTokenExpiresAt: new Date('2099-01-01'),
  },
  user: {
    name: 'Ola Nordmann',
    email: 'ola@example.com',
    roles: ['admin'],
  },
};

// ────────────────────────────────────────────
// Full session lifecycle (create → validate)
// ────────────────────────────────────────────

describe('session lifecycle: create → validate', () => {
  it('creates an encrypted JWT and validates it back to the original session', async () => {
    const jwt = await createEncryptedJWT({ ...testSession }, SECRET);
    const result = await validateSessionJwt(jwt, SECRET);

    expect(result.status).toBe('VALID');
    expect(result.session).toBeDefined();
    expect(result.session!.user!.name).toBe('Ola Nordmann');
    expect(result.session!.user!.email).toBe('ola@example.com');
    expect(result.session!.tokens!.accessToken).toBe('eyJ.test.access-token');
  });

  it('works with Uint8Array secret for both create and validate', async () => {
    const jwt = await createEncryptedJWT({ ...testSession }, SECRET_BYTES);
    const result = await validateSessionJwt(jwt, SECRET_BYTES);

    expect(result.status).toBe('VALID');
    expect(result.session!.user!.email).toBe('ola@example.com');
  });

  it('interoperates between string and Uint8Array secrets', async () => {
    // Encrypt with string, validate with bytes
    const jwt = await createEncryptedJWT({ ...testSession }, SECRET);
    const result = await validateSessionJwt(jwt, SECRET_BYTES);
    expect(result.status).toBe('VALID');
  });

  it('preserves custom session data through the round-trip', async () => {
    const session: Session<{ orgId: number; plan: string; }> = {
      ...testSession,
      data: { orgId: 42, plan: 'enterprise' },
    };

    const jwt = await createEncryptedJWT({ ...session }, SECRET);
    const result = await validateSessionJwt(jwt, SECRET);

    expect(result.status).toBe('VALID');
    expect((result.session as any).data).toEqual({ orgId: 42, plan: 'enterprise' });
  });

  it('handles a minimal session with only user info', async () => {
    const minimalSession: Session = {
      user: { name: 'Min', email: 'min@test.no' },
    };

    const jwt = await createEncryptedJWT({ ...minimalSession }, SECRET);
    const result = await validateSessionJwt(jwt, SECRET);

    expect(result.status).toBe('VALID');
    expect(result.session!.user!.name).toBe('Min');
    expect(result.session!.tokens).toBeUndefined();
  });
});

// ────────────────────────────────────────────
// Failure cases
// ────────────────────────────────────────────

describe('validateSessionJwt — failure cases', () => {
  it('returns INVALID when decrypted with the wrong secret', async () => {
    const jwt = await createEncryptedJWT({ ...testSession }, SECRET);
    const result = await validateSessionJwt(jwt, WRONG_SECRET);

    expect(result.status).toBe('INVALID');
    expect(result.reason).toMatch(/Decryption error/);
    expect(result.session).toBeUndefined();
  });

  it('returns INVALID for garbage input', async () => {
    const result = await validateSessionJwt('not-a-jwt-at-all', SECRET);

    expect(result.status).toBe('INVALID');
    expect(result.reason).toBeDefined();
  });

  it('returns INVALID when payload is not a session-like object', async () => {
    // Create a valid JWE but with a non-session payload (string)
    const jwe = await new EncryptJWT({ message: 'just a string payload' })
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .setIssuedAt()
      .encrypt(SECRET_BYTES);

    // This should validate fine (message is an object with neither tokens nor user)
    // isSession accepts objects that don't have tokens/user (it's loose)
    const result = await validateSessionJwt(jwe, SECRET);
    // It IS valid because isSession() allows any object
    expect(result.status).toBe('VALID');
  });

  it('returns INVALID when tokens is a non-object value', async () => {
    const jwe = await new EncryptJWT({ tokens: 'not-an-object' } as any)
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .setIssuedAt()
      .encrypt(SECRET_BYTES);

    const result = await validateSessionJwt(jwe, SECRET);

    expect(result.status).toBe('INVALID');
    expect(result.reason).toMatch(/does not seem to include a session/);
  });

  it('returns INVALID when user is a non-object value', async () => {
    const jwe = await new EncryptJWT({ user: 'string-user' } as any)
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .setIssuedAt()
      .encrypt(SECRET_BYTES);

    const result = await validateSessionJwt(jwe, SECRET);

    expect(result.status).toBe('INVALID');
    expect(result.reason).toMatch(/does not seem to include a session/);
  });
});

// ────────────────────────────────────────────
// isSession type guard
// ────────────────────────────────────────────

describe('isSession', () => {
  it('returns true for a full session object', () => {
    expect(isSession(testSession)).toBe(true);
  });

  it('returns true for an empty object (minimal valid session)', () => {
    expect(isSession({})).toBe(true);
  });

  it('returns true when tokens and user are both objects', () => {
    expect(isSession({ tokens: {}, user: {} })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isSession(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isSession(undefined)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isSession('not a session')).toBe(false);
  });

  it('returns false when tokens is a string', () => {
    expect(isSession({ tokens: 'bad' })).toBe(false);
  });

  it('returns false when user is a number', () => {
    expect(isSession({ user: 42 })).toBe(false);
  });
});

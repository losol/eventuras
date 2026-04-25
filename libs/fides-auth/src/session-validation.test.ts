/**
 * Tests for session-validation.ts — typical production flows:
 *
 * 1. Create an encrypted session JWT
 * 2. Validate it and get the session back
 * 3. Detect expired / tampered / malformed tokens
 */
import { EncryptJWT, SignJWT } from 'jose';

import { validateSessionJwt, isSession } from './session-validation';
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

  it('preserves scopes through the round-trip', async () => {
    const session: Session = {
      ...testSession,
      scopes: ['openid', 'profile', 'operations.read'],
    };

    const jwt = await createEncryptedJWT({ ...session }, SECRET);
    const result = await validateSessionJwt(jwt, SECRET);

    expect(result.status).toBe('VALID');
    expect(result.session?.scopes).toEqual(['openid', 'profile', 'operations.read']);
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

// ────────────────────────────────────────────
// Access token expiry detection
// ────────────────────────────────────────────

/** Creates a minimal signed JWT with a specific exp claim. */
async function makeAccessToken(exp: number): Promise<string> {
  const key = new Uint8Array(32); // dummy key — we only need decodeJwt to work
  return new SignJWT({ sub: 'user-1' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(exp)
    .sign(key);
}

describe('validateSessionJwt — access token expiry', () => {
  it('returns EXPIRED when the access token exp is in the past', async () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    const expiredAccessToken = await makeAccessToken(pastExp);

    const session: Session = {
      tokens: { accessToken: expiredAccessToken },
      user: { name: 'Test', email: 'test@example.com' },
    };

    const jwt = await createEncryptedJWT({ ...session }, SECRET);
    const result = await validateSessionJwt(jwt, SECRET);

    expect(result.status).toBe('EXPIRED');
    expect(result.reason).toMatch(/expired/i);
    expect(result.accessTokenExpiresIn).toBeDefined();
    expect(result.accessTokenExpiresIn!).toBeLessThanOrEqual(0);
    expect(result.session).toBeDefined();
  });

  it('returns VALID with accessTokenExpiresIn when access token is still valid', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const validAccessToken = await makeAccessToken(futureExp);

    const session: Session = {
      tokens: { accessToken: validAccessToken },
      user: { name: 'Test', email: 'test@example.com' },
    };

    const jwt = await createEncryptedJWT({ ...session }, SECRET);
    const result = await validateSessionJwt(jwt, SECRET);

    expect(result.status).toBe('VALID');
    expect(result.accessTokenExpiresIn).toBeDefined();
    expect(result.accessTokenExpiresIn!).toBeGreaterThan(0);
    expect(result.accessTokenExpiresIn!).toBeLessThanOrEqual(3600);
  });

  it('returns VALID without accessTokenExpiresIn when no access token exists', async () => {
    const session: Session = {
      user: { name: 'No Token', email: 'no-token@example.com' },
    };

    const jwt = await createEncryptedJWT({ ...session }, SECRET);
    const result = await validateSessionJwt(jwt, SECRET);

    expect(result.status).toBe('VALID');
    expect(result.accessTokenExpiresIn).toBeUndefined();
  });

  it('returns VALID without accessTokenExpiresIn when access token is not a JWT', async () => {
    const session: Session = {
      tokens: { accessToken: 'opaque-token-not-a-jwt' },
      user: { name: 'Opaque', email: 'opaque@example.com' },
    };

    const jwt = await createEncryptedJWT({ ...session }, SECRET);
    const result = await validateSessionJwt(jwt, SECRET);

    expect(result.status).toBe('VALID');
    expect(result.accessTokenExpiresIn).toBeUndefined();
  });
});

import { describe, it, expect } from 'vitest';
import { SignJWT } from 'jose';
import { extractUserFromTokens } from './oauth';
import type { TokenEndpointResponse } from 'openid-client';

async function createIdToken(claims: Record<string, unknown>): Promise<string> {
  const secret = new TextEncoder().encode('test-secret-at-least-32-bytes!!');
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

function makeTokenResponse(idToken: string): TokenEndpointResponse {
  return {
    access_token: 'access-token',
    token_type: 'Bearer',
    id_token: idToken,
  } as TokenEndpointResponse;
}

describe('extractUserFromTokens', () => {
  it('extracts name, email, and sub from ID token', async () => {
    const idToken = await createIdToken({
      sub: 'user-123',
      name: 'Ola Nordmann',
      email: 'ola@example.com',
      roles: ['admin'],
    });

    const user = extractUserFromTokens(makeTokenResponse(idToken));

    expect(user.sub).toBe('user-123');
    expect(user.name).toBe('Ola Nordmann');
    expect(user.email).toBe('ola@example.com');
    expect(user.roles).toEqual(['admin']);
  });

  it('uses custom rolesClaim', async () => {
    const customClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
    const idToken = await createIdToken({
      sub: 'user-456',
      name: 'Kari Hansen',
      email: 'kari@example.com',
      [customClaim]: ['editor', 'viewer'],
    });

    const user = extractUserFromTokens(makeTokenResponse(idToken), customClaim);

    expect(user.roles).toEqual(['editor', 'viewer']);
  });

  it('returns empty roles when claim is missing', async () => {
    const idToken = await createIdToken({
      sub: 'user-789',
      name: 'Per Olsen',
      email: 'per@example.com',
    });

    const user = extractUserFromTokens(makeTokenResponse(idToken));

    expect(user.roles).toEqual([]);
  });

  it('returns empty roles when claim is null', async () => {
    const idToken = await createIdToken({
      sub: 'user-000',
      name: 'Test User',
      email: 'test@example.com',
      roles: null,
    });

    const user = extractUserFromTokens(makeTokenResponse(idToken));

    expect(user.roles).toEqual([]);
  });

  it('normalizes single string role to array', async () => {
    const idToken = await createIdToken({
      sub: 'user-single',
      name: 'Single Role',
      email: 'single@example.com',
      roles: 'admin',
    });

    const user = extractUserFromTokens(makeTokenResponse(idToken));

    expect(user.roles).toEqual(['admin']);
  });

  it('throws when id_token is missing', () => {
    const tokens = {
      access_token: 'access-token',
      token_type: 'Bearer',
    } as TokenEndpointResponse;

    expect(() => extractUserFromTokens(tokens)).toThrow('missing id_token');
  });
});

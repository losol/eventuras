import { describe, it, expect } from 'vitest';
import { SignJWT } from 'jose';
import { buildSessionFromTokens } from './oauth';
import type { TokenEndpointResponse } from 'openid-client';

async function createIdToken(claims: Record<string, unknown>): Promise<string> {
  const secret = new TextEncoder().encode('test-secret-at-least-32-bytes!!');
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

async function makeTokenResponse(
  extra?: Partial<TokenEndpointResponse>,
): Promise<TokenEndpointResponse> {
  const idToken = await createIdToken({
    sub: 'user-123',
    name: 'Ola Nordmann',
    email: 'ola@example.com',
  });
  return {
    access_token: 'access-token',
    token_type: 'Bearer',
    id_token: idToken,
    ...extra,
  } as TokenEndpointResponse;
}

describe('buildSessionFromTokens — scopes', () => {
  it('populates scopes from a space-separated scope string', async () => {
    const tokens = await makeTokenResponse({ scope: 'openid profile email' });
    const session = buildSessionFromTokens(tokens);
    expect(session.scopes).toEqual(['openid', 'profile', 'email']);
  });

  it('leaves scopes undefined when scope field is absent', async () => {
    const tokens = await makeTokenResponse();
    const session = buildSessionFromTokens(tokens);
    expect(session.scopes).toBeUndefined();
  });

  it('leaves scopes undefined when scope is an empty string', async () => {
    const tokens = await makeTokenResponse({ scope: '' });
    const session = buildSessionFromTokens(tokens);
    expect(session.scopes).toBeUndefined();
  });

  it('leaves scopes undefined when scope contains only whitespace', async () => {
    const tokens = await makeTokenResponse({ scope: '   ' });
    const session = buildSessionFromTokens(tokens);
    expect(session.scopes).toBeUndefined();
  });

  it('leaves scopes undefined when scope field is not a string', async () => {
    const tokens = await makeTokenResponse({ scope: 123 as unknown as string });
    const session = buildSessionFromTokens(tokens);
    expect(session.scopes).toBeUndefined();
  });

  it('handles multiple consecutive spaces by filtering empty strings', async () => {
    const tokens = await makeTokenResponse({ scope: 'openid  profile   email' });
    const session = buildSessionFromTokens(tokens);
    expect(session.scopes).toEqual(['openid', 'profile', 'email']);
  });

  it('handles a single scope value', async () => {
    const tokens = await makeTokenResponse({ scope: 'openid' });
    const session = buildSessionFromTokens(tokens);
    expect(session.scopes).toEqual(['openid']);
  });

  it('still populates user and tokens alongside scopes', async () => {
    const tokens = await makeTokenResponse({ scope: 'openid profile' });
    const session = buildSessionFromTokens(tokens);
    expect(session.user?.email).toBe('ola@example.com');
    expect(session.tokens?.accessToken).toBe('access-token');
    expect(session.scopes).toEqual(['openid', 'profile']);
  });
});

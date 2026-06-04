/**
 * Regression test for the proxy callback-path bug.
 *
 * Behind a TLS-terminating proxy `applicationUrl` is just the origin, so the
 * reconstructed callback URL must take its path from the incoming request.
 * If it doesn't, the token-exchange redirect_uri collapses to "/" and Keycloak
 * rejects it with invalid_redirect_uri (Auth0 tolerated the mismatch).
 *
 * We mock the OAuth machinery (tested in @eventuras/fides-auth) and assert on
 * the URL handed to exchangeAuthorizationCode.
 */
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@eventuras/fides-auth/oauth', () => ({
  exchangeAuthorizationCode: vi.fn(),
  buildSessionFromTokens: vi.fn(),
  validateReturnUrl: vi.fn(),
}));
vi.mock('./cookies', () => ({
  getAuthCookie: vi.fn(),
  setSessionCookie: vi.fn(),
  deleteAuthCookies: vi.fn(),
}));
vi.mock('./request', () => ({
  globalGETRateLimit: vi.fn(),
}));
vi.mock('./session', () => ({
  createSession: vi.fn(),
}));

import { handleOidcCallback } from './oidc-callback';
import {
  exchangeAuthorizationCode,
  buildSessionFromTokens,
  validateReturnUrl,
} from '@eventuras/fides-auth/oauth';
import { getAuthCookie } from './cookies';
import { globalGETRateLimit } from './request';
import { createSession } from './session';

const mockedExchange = vi.mocked(exchangeAuthorizationCode);
const mockedBuildSession = vi.mocked(buildSessionFromTokens);
const mockedValidateReturnUrl = vi.mocked(validateReturnUrl);
const mockedGetAuthCookie = vi.mocked(getAuthCookie);
const mockedRateLimit = vi.mocked(globalGETRateLimit);
const mockedCreateSession = vi.mocked(createSession);

const config = {
  oauthConfig: {
    issuer: 'https://id.example.test/realms/test',
    clientId: 'web',
    clientSecret: 'shh',
    redirect_uri: 'https://host.example.test/api/auth/callback/oidc',
    scope: 'openid',
  },
  // Public origin only — no path — as seen behind a TLS-terminating proxy.
  applicationUrl: 'https://host.example.test',
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedRateLimit.mockResolvedValue(true);
  mockedGetAuthCookie.mockImplementation(async (name: string) =>
    name === 'oauth_state' ? 'xyz' : name === 'oauth_code_verifier' ? 'verifier' : null,
  );
  mockedExchange.mockResolvedValue({ accessToken: 'a' } as any);
  mockedBuildSession.mockReturnValue({} as any);
  mockedCreateSession.mockResolvedValue('jwt');
  mockedValidateReturnUrl.mockReturnValue(new URL('https://host.example.test/'));
});

describe('handleOidcCallback — proxy callback path', () => {
  it('passes the full callback path and https scheme to the token exchange', async () => {
    // Internal hop arrives over http at the callback path with the auth code.
    const request = new Request(
      'http://internal/api/auth/callback/oidc?code=abc&state=xyz',
    );

    const response = await handleOidcCallback(request, config);

    expect(response.status).toBe(302);
    expect(mockedExchange).toHaveBeenCalledTimes(1);

    const passedUrl = mockedExchange.mock.calls[0]![1] as URL;
    expect(passedUrl.pathname).toBe('/api/auth/callback/oidc');
    expect(passedUrl.protocol).toBe('https:');
    expect(passedUrl.host).toBe('host.example.test');
    expect(passedUrl.searchParams.get('code')).toBe('abc');
  });
});

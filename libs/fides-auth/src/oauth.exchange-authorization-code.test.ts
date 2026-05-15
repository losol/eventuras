/**
 * Regression test for `exchangeAuthorizationCode` callback URL normalization.
 *
 * If these tests fail, run from the repo root:
 *   pnpm --filter @eventuras/fides-auth test
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('openid-client', () => ({
  discovery: vi.fn(),
  authorizationCodeGrant: vi.fn(),
  ClientSecretPost: vi.fn(() => () => undefined),
}));

import * as openid from 'openid-client';
import { exchangeAuthorizationCode, type OAuthConfig } from './oauth';

function makeOAuthConfig(overrides: Partial<OAuthConfig> = {}): OAuthConfig {
  return {
    issuer: 'https://auth.example.com',
    clientId: 'test-client',
    clientSecret: 'test-secret',
    redirect_uri: 'https://app.example.com/callback',
    scope: 'openid profile email',
    ...overrides,
  };
}

const discoveredConfig = {} as unknown as openid.Configuration;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(openid.discovery).mockResolvedValue(discoveredConfig);
  vi.mocked(openid.authorizationCodeGrant).mockResolvedValue({
    access_token: 'access',
    token_type: 'Bearer',
    expires_in: 3600,
  } as openid.TokenEndpointResponse);
});

describe('exchangeAuthorizationCode — callback URL normalization', () => {
  it('rewrites the callback URL origin to oauthConfig.redirect_uri before exchange', async () => {
    // Reverse proxy without trust-proxy hands the pod an http:// request,
    // even though the public origin is https://.
    const proxyStrippedCallback = new URL(
      'http://pod.internal:3000/callback?code=auth-code-123&state=state-xyz',
    );

    await exchangeAuthorizationCode(
      makeOAuthConfig(),
      proxyStrippedCallback,
      'verifier-123',
      'state-xyz',
    );

    const [, passedCallbackUrl] = vi.mocked(openid.authorizationCodeGrant).mock.calls[0];
    expect(passedCallbackUrl).toBeInstanceOf(URL);
    expect((passedCallbackUrl as URL).origin).toBe('https://app.example.com');
    expect((passedCallbackUrl as URL).pathname).toBe('/callback');
    expect((passedCallbackUrl as URL).searchParams.get('code')).toBe('auth-code-123');
    expect((passedCallbackUrl as URL).searchParams.get('state')).toBe('state-xyz');
  });

  it('keeps the configured host when the callback pathname starts with //', async () => {
    // A protocol-relative-looking pathname (e.g. forwarded via a misbehaving
    // proxy or attacker-crafted request) must not swap the host of the
    // normalized callback URL.
    const maliciousCallback = new URL(
      'http://pod.internal//evil.com/callback?code=auth-code-789&state=state-pwn',
    );
    expect(maliciousCallback.pathname).toBe('//evil.com/callback');

    await exchangeAuthorizationCode(
      makeOAuthConfig(),
      maliciousCallback,
      'verifier-789',
      'state-pwn',
    );

    const [, passedCallbackUrl] = vi.mocked(openid.authorizationCodeGrant).mock.calls[0];
    expect((passedCallbackUrl as URL).host).toBe('app.example.com');
    expect((passedCallbackUrl as URL).origin).toBe('https://app.example.com');
  });

  it('passes through unchanged when callback already uses the configured origin', async () => {
    const matchingCallback = new URL(
      'https://app.example.com/callback?code=auth-code-456&state=state-abc',
    );

    await exchangeAuthorizationCode(
      makeOAuthConfig(),
      matchingCallback,
      'verifier-456',
      'state-abc',
    );

    const [, passedCallbackUrl] = vi.mocked(openid.authorizationCodeGrant).mock.calls[0];
    expect((passedCallbackUrl as URL).toString()).toBe(matchingCallback.toString());
  });
});

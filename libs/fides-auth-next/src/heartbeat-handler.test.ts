/**
 * Tests for the heartbeat route-handler factory.
 *
 * The handler is glue: rate-limit → load session → refresh → respond. We mock
 * the session module so the tests focus on the handler's branching and
 * response shape, not the OAuth machinery (which is already tested in
 * @eventuras/fides-auth).
 */
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('./session', () => ({
  getCurrentSession: vi.fn(),
  refreshCurrentSession: vi.fn(),
}));
vi.mock('./request', () => ({
  globalPOSTRateLimit: vi.fn(),
}));

import { handleHeartbeat } from './heartbeat-handler';
import { getCurrentSession, refreshCurrentSession } from './session';
import { globalPOSTRateLimit } from './request';

const mockedGetCurrentSession = vi.mocked(getCurrentSession);
const mockedRefreshCurrentSession = vi.mocked(refreshCurrentSession);
const mockedRateLimit = vi.mocked(globalPOSTRateLimit);

const config = {
  oauthConfig: {
    issuer: 'https://example.test',
    clientId: 'test',
    clientSecret: 'shh',
    redirect_uri: 'https://app.test/callback',
    scope: 'openid',
  },
};

const makeRequest = (method: string): Request =>
  new Request('https://app.test/api/auth/heartbeat', { method });

beforeEach(() => {
  vi.clearAllMocks();
  // Most tests assume rate-limit allows the request.
  mockedRateLimit.mockResolvedValue(true);
});

describe('handleHeartbeat — method handling', () => {
  it('returns 405 with Allow header for non-POST requests', async () => {
    const response = await handleHeartbeat(makeRequest('GET'), config);

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
    // Pre-condition: never hit rate-limit or session lookup on a method reject.
    expect(mockedRateLimit).not.toHaveBeenCalled();
    expect(mockedGetCurrentSession).not.toHaveBeenCalled();
  });

  it('returns 405 for PUT, DELETE, PATCH too', async () => {
    for (const method of ['PUT', 'DELETE', 'PATCH']) {
      const response = await handleHeartbeat(makeRequest(method), config);
      expect(response.status, `method ${method}`).toBe(405);
    }
  });
});

describe('handleHeartbeat — rate limiting', () => {
  it('returns 429 when global POST rate-limit denies the request', async () => {
    mockedRateLimit.mockResolvedValue(false);

    const response = await handleHeartbeat(makeRequest('POST'), config);

    expect(response.status).toBe(429);
    // Should NOT proceed to session lookup once rate-limited.
    expect(mockedGetCurrentSession).not.toHaveBeenCalled();
  });
});

describe('handleHeartbeat — authentication', () => {
  it('returns 401 when there is no current session', async () => {
    mockedGetCurrentSession.mockResolvedValue(null);

    const response = await handleHeartbeat(makeRequest('POST'), config);

    expect(response.status).toBe(401);
    expect(mockedRefreshCurrentSession).not.toHaveBeenCalled();
  });

  it('returns 401 when session exists but has no refresh token', async () => {
    mockedGetCurrentSession.mockResolvedValue({
      tokens: { accessToken: 'access-only' },
    } as any);

    const response = await handleHeartbeat(makeRequest('POST'), config);

    expect(response.status).toBe(401);
    expect(mockedRefreshCurrentSession).not.toHaveBeenCalled();
  });

  it('returns 401 when refreshCurrentSession returns null (refresh failed)', async () => {
    mockedGetCurrentSession.mockResolvedValue({
      tokens: { accessToken: 'a', refreshToken: 'r' },
    } as any);
    mockedRefreshCurrentSession.mockResolvedValue(null);

    const response = await handleHeartbeat(makeRequest('POST'), config);

    expect(response.status).toBe(401);
    expect(mockedRefreshCurrentSession).toHaveBeenCalledWith(config.oauthConfig);
  });
});

describe('handleHeartbeat — success', () => {
  it('returns 200 with accessTokenExpiresAt and no-store Cache-Control', async () => {
    const expiresAt = new Date('2026-05-21T20:00:00.000Z');
    mockedGetCurrentSession.mockResolvedValue({
      tokens: { accessToken: 'a', refreshToken: 'r' },
    } as any);
    mockedRefreshCurrentSession.mockResolvedValue({
      tokens: {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        accessTokenExpiresAt: expiresAt,
      },
    } as any);

    const response = await handleHeartbeat(makeRequest('POST'), config);

    expect(response.status).toBe(200);
    // Auth/session endpoints must never be cached by browser or intermediaries.
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');

    const body = await response.json();
    expect(body).toMatchObject({
      accessTokenExpiresAt: expiresAt.toISOString(),
    });
  });

  it('returns accessTokenExpiresAt: null when the refreshed session has no expiry', async () => {
    mockedGetCurrentSession.mockResolvedValue({
      tokens: { accessToken: 'a', refreshToken: 'r' },
    } as any);
    mockedRefreshCurrentSession.mockResolvedValue({
      tokens: { accessToken: 'new', refreshToken: 'newR' }, // no accessTokenExpiresAt
    } as any);

    const response = await handleHeartbeat(makeRequest('POST'), config);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.accessTokenExpiresAt).toBeNull();
  });
});

/**
 * Tests for Pushed Authorization Requests (RFC 9126) support in oauth.ts.
 *
 * Covers:
 * - `buildAuthorizationUrlWithPAR` — thin wrapper over openid-client.
 * - `discoverAndBuildAuthorizationUrl` — routing between PAR and non-PAR
 *   based on `OAuthConfig.usePar` and provider discovery metadata.
 *
 * If these tests fail, run from the repo root:
 *   pnpm --filter @eventuras/fides-auth test
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('openid-client', () => ({
  discovery: vi.fn(),
  buildAuthorizationUrl: vi.fn(),
  buildAuthorizationUrlWithPAR: vi.fn(),
  ClientSecretPost: vi.fn(() => () => undefined),
  randomPKCECodeVerifier: vi.fn(() => 'verifier-123'),
  calculatePKCECodeChallenge: vi.fn(async () => 'challenge-abc'),
  randomState: vi.fn(() => 'state-xyz'),
}));

import * as openid from 'openid-client';
import {
  buildAuthorizationUrlWithPAR,
  discoverAndBuildAuthorizationUrl,
  type OAuthConfig,
  type PKCEOptions,
} from './oauth';
import { configureLogger, type FidesLogger } from './logger';

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

function makePkce(): PKCEOptions {
  return {
    code_verifier: 'verifier-123',
    code_challenge: 'challenge-abc',
    state: 'state-xyz',
    parameters: {
      redirect_uri: 'https://app.example.com/callback',
      scope: 'openid profile email',
      code_challenge: 'challenge-abc',
      code_challenge_method: 'S256',
      state: 'state-xyz',
    },
  };
}

function makeDiscoveredConfig(parEndpoint?: string): openid.Configuration {
  return {
    serverMetadata: () => ({
      pushed_authorization_request_endpoint: parEndpoint,
    }),
  } as unknown as openid.Configuration;
}

type LogEntry = { level: string; msg?: string; data?: Record<string, unknown> };

function installTestLogger(): LogEntry[] {
  const entries: LogEntry[] = [];
  const record =
    (level: string) => (data?: Record<string, unknown> | string, msg?: string) => {
      const entry: LogEntry = { level };
      if (typeof data === 'string') {
        entry.msg = data;
      } else {
        if (msg !== undefined) entry.msg = msg;
        if (data) entry.data = data;
      }
      entries.push(entry);
    };
  configureLogger({
    create() {
      return {
        debug: record('debug'),
        info: record('info'),
        warn: record('warn'),
        error: record('error'),
      };
    },
  });
  return entries;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// `installTestLogger()` mutates the module-global logger factory.
// Restore the default after each test so a test-local factory can't leak
// into later tests — mirrors the teardown pattern in logger.test.ts.
afterEach(() => {
  configureLogger({
    create({ namespace, context }) {
      return createDefaultConsoleLogger(namespace, context);
    },
  });
});

function createDefaultConsoleLogger(
  namespace: string,
  context?: Record<string, unknown>,
): FidesLogger {
  const log =
    (method: 'debug' | 'info' | 'warn' | 'error') =>
    (data?: Record<string, unknown> | string, msg?: string) => {
      const entry: Record<string, unknown> = {
        level: method,
        time: new Date().toISOString(),
        namespace,
        ...context,
      };
      if (typeof data === 'string') {
        entry.msg = data;
      } else {
        if (msg !== undefined) entry.msg = msg;
        if (data) Object.assign(entry, data);
      }
      console[method](JSON.stringify(entry));
    };

  return {
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
  };
}

describe('buildAuthorizationUrlWithPAR', () => {
  it('delegates to openid.buildAuthorizationUrlWithPAR with the PKCE parameters', async () => {
    const discovered = makeDiscoveredConfig('https://auth.example.com/par');
    const parUrl = new URL(
      'https://auth.example.com/authorize?client_id=x&request_uri=urn:ietf:params:oauth:request_uri:1',
    );
    vi.mocked(openid.buildAuthorizationUrlWithPAR).mockResolvedValue(parUrl);

    const pkce = makePkce();
    const result = await buildAuthorizationUrlWithPAR(discovered, pkce);

    expect(openid.buildAuthorizationUrlWithPAR).toHaveBeenCalledWith(
      discovered,
      pkce.parameters,
    );
    expect(result).toBe(parUrl);
  });

  it('propagates errors from openid-client', async () => {
    const discovered = makeDiscoveredConfig('https://auth.example.com/par');
    vi.mocked(openid.buildAuthorizationUrlWithPAR).mockRejectedValue(new Error('par failed'));

    await expect(
      buildAuthorizationUrlWithPAR(discovered, makePkce()),
    ).rejects.toThrow('par failed');
  });
});

describe('discoverAndBuildAuthorizationUrl — PAR routing', () => {
  it('uses PAR when usePar=true and the provider advertises it', async () => {
    const discovered = makeDiscoveredConfig('https://auth.example.com/par');
    vi.mocked(openid.discovery).mockResolvedValue(discovered);
    const parUrl = new URL(
      'https://auth.example.com/authorize?client_id=x&request_uri=urn:1',
    );
    vi.mocked(openid.buildAuthorizationUrlWithPAR).mockResolvedValue(parUrl);

    const result = await discoverAndBuildAuthorizationUrl(
      makeOAuthConfig({ usePar: true }),
      makePkce(),
    );

    expect(openid.buildAuthorizationUrlWithPAR).toHaveBeenCalledTimes(1);
    expect(openid.buildAuthorizationUrl).not.toHaveBeenCalled();
    expect(result).toBe(parUrl);
  });

  it('throws when usePar=true but the provider does not advertise PAR', async () => {
    vi.mocked(openid.discovery).mockResolvedValue(makeDiscoveredConfig());

    await expect(
      discoverAndBuildAuthorizationUrl(
        makeOAuthConfig({ usePar: true }),
        makePkce(),
      ),
    ).rejects.toThrow(/does not advertise pushed_authorization_request_endpoint/);

    expect(openid.buildAuthorizationUrlWithPAR).not.toHaveBeenCalled();
    expect(openid.buildAuthorizationUrl).not.toHaveBeenCalled();
  });

  it('uses the standard flow when usePar is unset and logs an advisory if PAR is advertised', async () => {
    const discovered = makeDiscoveredConfig('https://auth.example.com/par');
    vi.mocked(openid.discovery).mockResolvedValue(discovered);
    const authUrl = new URL('https://auth.example.com/authorize?client_id=x');
    vi.mocked(openid.buildAuthorizationUrl).mockReturnValue(authUrl);

    const logs = installTestLogger();

    const result = await discoverAndBuildAuthorizationUrl(
      makeOAuthConfig(),
      makePkce(),
    );

    expect(openid.buildAuthorizationUrl).toHaveBeenCalledTimes(1);
    expect(openid.buildAuthorizationUrlWithPAR).not.toHaveBeenCalled();
    expect(result).toBe(authUrl);

    const advisory = logs.find(
      (e) =>
        e.level === 'info' &&
        typeof e.msg === 'string' &&
        e.msg.includes('Provider advertises PAR but usePar is not enabled'),
    );
    expect(advisory).toBeDefined();
    expect(advisory?.msg).toContain('set OAuthConfig.usePar=true to use it');
  });

  it('uses the standard flow without advisory when the provider does not advertise PAR', async () => {
    vi.mocked(openid.discovery).mockResolvedValue(makeDiscoveredConfig());
    const authUrl = new URL('https://auth.example.com/authorize?client_id=x');
    vi.mocked(openid.buildAuthorizationUrl).mockReturnValue(authUrl);

    const logs = installTestLogger();

    await discoverAndBuildAuthorizationUrl(makeOAuthConfig(), makePkce());

    expect(openid.buildAuthorizationUrl).toHaveBeenCalledTimes(1);
    expect(openid.buildAuthorizationUrlWithPAR).not.toHaveBeenCalled();

    const advisory = logs.find(
      (e) =>
        e.level === 'info' &&
        typeof e.msg === 'string' &&
        e.msg.includes('Provider advertises PAR'),
    );
    expect(advisory).toBeUndefined();
  });

  it('uses the standard flow when usePar=false even if PAR is advertised', async () => {
    vi.mocked(openid.discovery).mockResolvedValue(
      makeDiscoveredConfig('https://auth.example.com/par'),
    );
    const authUrl = new URL('https://auth.example.com/authorize?client_id=x');
    vi.mocked(openid.buildAuthorizationUrl).mockReturnValue(authUrl);

    const result = await discoverAndBuildAuthorizationUrl(
      makeOAuthConfig({ usePar: false }),
      makePkce(),
    );

    expect(openid.buildAuthorizationUrl).toHaveBeenCalledTimes(1);
    expect(openid.buildAuthorizationUrlWithPAR).not.toHaveBeenCalled();
    expect(result).toBe(authUrl);
  });
});

import { createFidesAuth, type CookieStore } from '@eventuras/fides-auth/server';
import { Logger } from '@eventuras/logger';
import * as fs from 'node:fs';

const logger = Logger.create({ namespace: 'e2e:api' });

// Get backend API URL from environment (required)
const BACKEND_API_URL = process.env.E2E_API_URL;
if (!BACKEND_API_URL) {
  throw new Error('E2E_API_URL environment variable is required');
}

// The web app's session secret, so the tests can read its session cookies.
const E2E_SESSION_SECRET = process.env.E2E_SESSION_SECRET;
if (!E2E_SESSION_SECRET) {
  throw new Error(
    'E2E_SESSION_SECRET environment variable is required for reading session cookies'
  );
}

// Reads sessions only, so the provider settings are placeholders. The redirect URI
// sets the cookie names (`__Host-session` over https), so it must be the web app's.
const sessionReader = createFidesAuth({
  oauthConfig: {
    issuer: 'https://e2e.invalid',
    clientId: 'e2e',
    clientSecret: 'unused',
    redirectUri: new URL('/api/auth/callback/oidc', process.env.E2E_WEB_URL).toString(),
    scope: 'openid',
  },
  secret: E2E_SESSION_SECRET,
});

/**
 * Extract the access token from a Playwright auth storage state, using
 * fides-auth's own reader so the tests follow its cookie format.
 * @param authFile - Path to the auth storage state file (e.g., 'tmp/auth/admin.json')
 * @returns The access token or null if not found
 */
export const getAccessTokenFromAuthFile = async (authFile: string): Promise<string | null> => {
  try {
    const authState = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
    const cookies: CookieStore = {
      get: name =>
        authState.cookies?.find((cookie: { name: string }) => cookie.name === name)?.value ?? null,
      set: () => {},
    };

    const tokens = await sessionReader.getTokens(cookies);
    if (!tokens?.accessToken) {
      logger.debug({ authFile }, 'No access token in session');
      return null;
    }
    return tokens.accessToken;
  } catch (error) {
    logger.error({ authFile, error }, 'Error reading auth file');
    return null;
  }
};

/**
 * Make an authenticated API request to the backend
 * @param endpoint - API endpoint (e.g., '/v3/events')
 * @param authFile - Path to the auth storage state file
 * @param options - Fetch options (method, body, etc.)
 * @returns The response from the API
 */
export const apiRequest = async <T = unknown>(
  endpoint: string,
  authFile: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = await getAccessTokenFromAuthFile(authFile);

  if (!token) {
    throw new Error(`No access token found in ${authFile}`);
  }

  const url = `${BACKEND_API_URL}${endpoint}`;
  logger.debug({ url }, 'Making authenticated API request');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
  }

  return response.json() as Promise<T>;
};

/**
 * Make an unauthenticated API request to the backend
 * @param endpoint - API endpoint (e.g., '/v3/events')
 * @param options - Fetch options (method, body, etc.)
 * @returns The response from the API
 */
export const publicApiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${BACKEND_API_URL}${endpoint}`;
  logger.debug({ url }, 'Making unauthenticated API request');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
  }

  return response.json() as Promise<T>;
};

/**
 * Admin API helper - makes requests with admin auth
 */
export const adminApi = {
  get: <T = unknown>(endpoint: string) =>
    apiRequest<T>(endpoint, 'tmp/auth/admin.json', { method: 'GET' }),

  post: <T = unknown>(endpoint: string, body: unknown) =>
    apiRequest<T>(endpoint, 'tmp/auth/admin.json', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T = unknown>(endpoint: string, body: unknown) =>
    apiRequest<T>(endpoint, 'tmp/auth/admin.json', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T = unknown>(endpoint: string) =>
    apiRequest<T>(endpoint, 'tmp/auth/admin.json', { method: 'DELETE' }),
};

/**
 * User API helper - makes requests with user auth
 */
export const userApi = {
  get: <T = unknown>(endpoint: string) =>
    apiRequest<T>(endpoint, 'tmp/auth/user.json', { method: 'GET' }),

  post: <T = unknown>(endpoint: string, body: unknown) =>
    apiRequest<T>(endpoint, 'tmp/auth/user.json', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T = unknown>(endpoint: string, body: unknown) =>
    apiRequest<T>(endpoint, 'tmp/auth/user.json', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T = unknown>(endpoint: string) =>
    apiRequest<T>(endpoint, 'tmp/auth/user.json', { method: 'DELETE' }),
};

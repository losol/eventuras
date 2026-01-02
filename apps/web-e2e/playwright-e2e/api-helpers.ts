import { Debug } from '@eventuras/logger';
import * as jose from 'jose';
import * as fs from 'fs';

const debug = Debug.create('e2e:api');

// Get backend API URL from environment (required)
const BACKEND_API_URL = process.env.EVENTURAS_TEST_EVENTS_API_BASE_URL;
if (!BACKEND_API_URL) {
  throw new Error('EVENTURAS_TEST_EVENTS_API_BASE_URL environment variable is required');
}

// Get session secret for decrypting JWE tokens (same as used by the application)
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required for decrypting session cookies');
}

/**
 * Converts a hex string to a Uint8Array.
 * Copied from @eventuras/fides-auth/utils to avoid ESM/CommonJS compatibility issues.
 */
function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return arr;
}

/**
 * Decrypts a JWE session token to extract the access token.
 * Uses the same encryption method as @eventuras/fides-auth.
 * @param jweToken - The encrypted JWE token from the session cookie
 * @returns The decrypted session object containing tokens
 */
async function decryptSessionToken(
  jweToken: string
): Promise<{ tokens?: { accessToken?: string } }> {
  if (!SESSION_SECRET) {
    throw new Error('SESSION_SECRET is required');
  }

  try {
    // Convert the hex session secret to Uint8Array (same as getSessionSecretUint8Array in fides-auth)
    const secretKey = hexToUint8Array(SESSION_SECRET);

    // Decrypt the JWE token using jose library
    const { payload } = await jose.jwtDecrypt(jweToken, secretKey);

    return payload as { tokens?: { accessToken?: string } };
  } catch (error) {
    debug('Error decrypting session token: %s', error);
    throw new Error(`Failed to decrypt session token: ${error}`);
  }
}

/**
 * Extract access token from Playwright auth storage state.
 * Decrypts the JWE session token to extract the access token.
 * @param authFile - Path to the auth storage state file (e.g., 'playwright-auth/admin.json')
 * @returns The access token or null if not found
 */
export const getAccessTokenFromAuthFile = async (authFile: string): Promise<string | null> => {
  try {
    const authState = JSON.parse(fs.readFileSync(authFile, 'utf-8'));

    // Get the session cookie
    const sessionCookie = authState.cookies?.find(
      (cookie: { name: string }) => cookie.name === 'session'
    );

    if (!sessionCookie) {
      debug('No session cookie found in auth file: %s', authFile);
      return null;
    }

    // Decrypt the JWE token to get the session data
    debug('Decrypting session token from: %s', authFile);
    const session = await decryptSessionToken(sessionCookie.value);

    const accessToken = session.tokens?.accessToken;
    if (!accessToken) {
      debug('No access token found in decrypted session');
      return null;
    }

    debug('Successfully extracted access token');
    return accessToken;
  } catch (error) {
    debug('Error reading auth file %s: %s', authFile, error);
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
  debug('Making authenticated API request to: %s', url);

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
  debug('Making unauthenticated API request to: %s', url);

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
    apiRequest<T>(endpoint, 'playwright-auth/admin.json', { method: 'GET' }),

  post: <T = unknown>(endpoint: string, body: unknown) =>
    apiRequest<T>(endpoint, 'playwright-auth/admin.json', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T = unknown>(endpoint: string, body: unknown) =>
    apiRequest<T>(endpoint, 'playwright-auth/admin.json', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T = unknown>(endpoint: string) =>
    apiRequest<T>(endpoint, 'playwright-auth/admin.json', { method: 'DELETE' }),
};

/**
 * User API helper - makes requests with user auth
 */
export const userApi = {
  get: <T = unknown>(endpoint: string) =>
    apiRequest<T>(endpoint, 'playwright-auth/user.json', { method: 'GET' }),

  post: <T = unknown>(endpoint: string, body: unknown) =>
    apiRequest<T>(endpoint, 'playwright-auth/user.json', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T = unknown>(endpoint: string, body: unknown) =>
    apiRequest<T>(endpoint, 'playwright-auth/user.json', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T = unknown>(endpoint: string) =>
    apiRequest<T>(endpoint, 'playwright-auth/user.json', { method: 'DELETE' }),
};

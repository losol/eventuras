import { generatePKCE, buildAuthorizationUrl, exchangeCodeForTokens } from '@eventuras/fides-auth/oauth-browser';
import type { OAuthConfig } from '@eventuras/fides-auth/oauth-browser';

/**
 * OAuth configuration for frontend
 * Points to the same OIDC provider we're building (dogfooding!)
 */
export const oauthConfig: OAuthConfig = {
  issuer: window.location.origin, // Self-reference
  clientId: 'idem-admin-ui',
  redirect_uri: `${window.location.origin}/callback`,
  scope: 'openid profile email',
};

// Auth module version - helps debug caching issues
const AUTH_VERSION = '2.0.0';
console.log(`🔐 Auth module loaded (v${AUTH_VERSION})`);

/**
 * Start OAuth login flow
 * Generates PKCE parameters and redirects to authorization endpoint
 *
 * IMPORTANT: We store the code_verifier keyed by state to prevent race conditions
 * when multiple login flows are started (e.g., multiple tabs, or clicking login twice).
 * Each flow has its own isolated storage.
 */
export async function startLogin() {
  try {
    // Generate PKCE parameters
    const pkce = await generatePKCE();

    // Store PKCE verifier keyed by state (to isolate concurrent flows)
    // This prevents one flow from overwriting another's PKCE parameters
    const storageKey = `pkce_verifier_${pkce.state}`;
    sessionStorage.setItem(storageKey, pkce.code_verifier);

    // ALSO store in legacy keys for backward compatibility with cached pages
    // TODO: Remove after cache transition period
    sessionStorage.setItem('pkce_code_verifier', pkce.code_verifier);
    sessionStorage.setItem('pkce_state', pkce.state);

    // Debug: Log what we're storing
    console.log('🔐 PKCE stored (v2):', {
      storageKey,
      verifierLength: pkce.code_verifier.length,
      verifierPrefix: pkce.code_verifier.substring(0, 10),
      challengePrefix: pkce.code_challenge.substring(0, 10),
      state: pkce.state,
    });

    // Build authorization URL
    const authUrl = buildAuthorizationUrl(oauthConfig, pkce);

    console.log('🔗 Auth URL:', authUrl);

    // Redirect to authorization endpoint
    window.location.href = authUrl;
  } catch (error) {
    console.error('Failed to start login:', error);
    throw error;
  }
}

/**
 * Handle OAuth callback
 * Exchanges authorization code for tokens
 *
 * The state parameter is used to look up the correct code_verifier,
 * allowing multiple concurrent OAuth flows without interference.
 */
export async function handleCallback(): Promise<{ accessToken: string; idToken: string }> {
  console.log(`🔄 handleCallback (v${AUTH_VERSION})`);

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');

  console.log('🔄 Callback params:', {
    code: code?.substring(0, 10) + '...',
    state,
    url: window.location.href,
  });

  if (!code) {
    throw new Error('No authorization code in callback');
  }

  if (!state) {
    throw new Error('No state parameter in callback');
  }

  // Get code verifier using state as the key (new method)
  const storageKey = `pkce_verifier_${state}`;
  let codeVerifier = sessionStorage.getItem(storageKey);

  // Fallback to legacy key if state-based key not found
  if (!codeVerifier) {
    const legacyState = sessionStorage.getItem('pkce_state');
    if (legacyState === state) {
      codeVerifier = sessionStorage.getItem('pkce_code_verifier');
      console.log('🔐 Using legacy PKCE storage (cached page detected)');
    }
  }

  console.log('🔐 Code verifier lookup:', {
    storageKey,
    found: !!codeVerifier,
    length: codeVerifier?.length,
    prefix: codeVerifier?.substring(0, 10),
  });

  if (!codeVerifier) {
    // Debug: List all sessionStorage keys to help diagnose
    const allKeys = Object.keys(sessionStorage);
    console.error('🔐 Available sessionStorage keys:', allKeys.filter(k => k.includes('pkce')));
    throw new Error('No code verifier found for this OAuth flow. The login session may have expired or been started in a different tab.');
  }

  console.log('🔄 Exchanging code for tokens...');
  // Exchange code for tokens
  const tokens = await exchangeCodeForTokens(oauthConfig, code, codeVerifier);

  // Clean up PKCE storage (both new and legacy)
  sessionStorage.removeItem(storageKey);
  sessionStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('pkce_state');

  // Store tokens in sessionStorage
  sessionStorage.setItem('access_token', tokens.access_token);
  sessionStorage.setItem('id_token', tokens.id_token);
  if (tokens.refresh_token) {
    sessionStorage.setItem('refresh_token', tokens.refresh_token);
  }

  return {
    accessToken: tokens.access_token,
    idToken: tokens.id_token,
  };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!sessionStorage.getItem('access_token');
}

/**
 * Get access token
 */
export function getAccessToken(): string | null {
  return sessionStorage.getItem('access_token');
}

/**
 * Decode JWT (simple base64 decode, no verification)
 */
export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Get user info from ID token
 */
export function getUserInfo(): {
  name?: string;
  email?: string;
  systemRole?: string;
} | null {
  const idToken = sessionStorage.getItem('id_token');
  if (!idToken) return null;

  const payload = decodeJWT(idToken);
  return {
    name: payload?.name,
    email: payload?.email,
    systemRole: payload?.system_role,
  };
}

/**
 * Check if user has admin role
 */
export function isAdmin(): boolean {
  const userInfo = getUserInfo();
  return (
    userInfo?.systemRole === 'system_admin' || userInfo?.systemRole === 'admin_reader'
  );
}

/**
 * Logout
 */
export function logout() {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('id_token');
  sessionStorage.removeItem('refresh_token');
  window.location.href = '/';
}

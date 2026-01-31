/**
 * Browser-compatible OAuth 2.0 + PKCE helpers
 *
 * This module provides OAuth 2.0 helpers that work in browser environments.
 * Unlike `oauth.ts` which uses openid-client (Node.js only), this uses
 * browser-native Web Crypto API for PKCE generation.
 *
 * **Use this in:**
 * - Vite/React SPAs
 * - Browser-only applications
 * - Any frontend that can't use Node.js APIs
 *
 * **Usage:**
 * ```typescript
 * import { generatePKCE, buildAuthorizationUrl, exchangeCodeForTokens }
 *   from '@eventuras/fides-auth/oauth-browser';
 *
 * // 1. Start OAuth flow
 * const pkce = await generatePKCE();
 * sessionStorage.setItem('code_verifier', pkce.code_verifier);
 * sessionStorage.setItem('state', pkce.state);
 *
 * const authUrl = buildAuthorizationUrl(config, pkce);
 * window.location.href = authUrl;
 *
 * // 2. Handle callback
 * const code = new URLSearchParams(window.location.search).get('code');
 * const verifier = sessionStorage.getItem('code_verifier');
 * const tokens = await exchangeCodeForTokens(config, code, verifier);
 * ```
 */

export interface OAuthConfig {
  issuer: string;
  clientId: string;
  redirect_uri: string;
  scope: string;
}

export interface PKCEParams {
  code_verifier: string;
  code_challenge: string;
  state: string;
}

/**
 * Generate random string for code verifier (PKCE)
 * Uses Web Crypto API (browser-compatible)
 */
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map((x) => charset[x % charset.length])
    .join('');
}

/**
 * Generate PKCE code challenge from verifier
 * Uses Web Crypto API SHA-256
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);

  // Base64URL encode
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generate PKCE parameters for OAuth flow
 */
export async function generatePKCE(): Promise<PKCEParams> {
  const code_verifier = generateRandomString(128);
  const code_challenge = await generateCodeChallenge(code_verifier);
  const state = generateRandomString(32);

  return {
    code_verifier,
    code_challenge,
    state,
  };
}

/**
 * Build authorization URL for OAuth flow
 */
export function buildAuthorizationUrl(
  config: OAuthConfig,
  pkce: PKCEParams
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirect_uri,
    response_type: 'code',
    scope: config.scope,
    state: pkce.state,
    code_challenge: pkce.code_challenge,
    code_challenge_method: 'S256',
  });

  return `${config.issuer}/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  config: OAuthConfig,
  code: string,
  codeVerifier: string
): Promise<{
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
}> {
  const response = await fetch(`${config.issuer}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirect_uri,
      client_id: config.clientId,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${response.status} - ${error}`);
  }

  return response.json();
}

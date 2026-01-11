/**
 * Vipps Login API Route
 *
 * Initiates Vipps OAuth flow with PKCE
 */

import { handleVippsLogin, resolveConfig } from '@eventuras/payload-vipps-auth';

import { getAllowedVippsLoginDomains, getPublicRequestOrigin } from '../_utils/request-origin';

export async function GET(request: Request) {
  const origin = getPublicRequestOrigin(request, {
    allowedDomains: getAllowedVippsLoginDomains(),
  });

  const config = resolveConfig({
    clientId: process.env.VIPPS_LOGIN_CLIENT_ID!,
    clientSecret: process.env.VIPPS_LOGIN_CLIENT_SECRET!,
    environment: process.env.VIPPS_LOGIN_ENVIRONMENT === 'production' ? 'production' : 'test',
    redirectUri: `${origin}/api/auth/vipps/callback`,
  });

  return handleVippsLogin(request, config);
}

/**
 * Vipps OAuth Callback Route
 *
 * Handles OAuth callback, exchanges code for tokens, and creates user session
 */

import config from '@payload-config';
import { getPayload } from 'payload';

import { handleVippsCallback, resolveConfig } from '@eventuras/payload-vipps-auth';

import { getAllowedVippsLoginDomains, getPublicRequestOrigin } from '../_utils/request-origin';

export async function GET(request: Request) {
  const origin = getPublicRequestOrigin(request, {
    allowedDomains: getAllowedVippsLoginDomains(),
  });

  const pluginConfig = resolveConfig({
    clientId: process.env.VIPPS_LOGIN_CLIENT_ID!,
    clientSecret: process.env.VIPPS_LOGIN_CLIENT_SECRET!,
    environment: process.env.VIPPS_LOGIN_ENVIRONMENT === 'production' ? 'production' : 'test',
    redirectUri: `${origin}/api/auth/vipps/callback`,
  });

  const payload = await getPayload({ config });

  return handleVippsCallback(request, pluginConfig, payload);
}

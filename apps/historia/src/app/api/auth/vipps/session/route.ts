/**
 * Vipps OAuth Session Route
 *
 * Triggers Payload auth strategies to create a session from the temporary Vipps auth cookie.
 */

import config from '@payload-config';
import { getPayload } from 'payload';

import { handleVippsSession } from '@eventuras/payload-vipps-auth';

import { getAllowedVippsLoginDomains, getPublicRequestOrigin } from '../_utils/request-origin';

export async function GET(request: Request) {
  const payload = await getPayload({ config });

  return handleVippsSession(request, payload, {
    adminPath: '/admin',
    onError: '/admin/login?error=auth_failed',
    getOrigin: (req) =>
      getPublicRequestOrigin(req, {
        allowedDomains: getAllowedVippsLoginDomains(),
      }),
  });
}

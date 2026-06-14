/* eslint no-process-env: 0 */

import { Logger } from '@eventuras/logger';
import { test as setup } from '@playwright/test';

import { loginPersona } from '../web/helpers/auth';
import { getAccessTokenFromAuthFile } from '../shared/api-helpers';
import { adminEmail } from '../../utils/personas';

const logger = Logger.create({ namespace: 'e2e:grant-admin' });

const ADMIN_AUTH = 'tmp/auth/admin.json';
const SYSTEMADMIN_AUTH = 'tmp/auth/systemadmin.json';
const ORG_ID = Number.parseInt(process.env.E2E_ORG_ID ?? '1', 10);
if (!Number.isInteger(ORG_ID) || ORG_ID <= 0) {
  throw new Error(`E2E_ORG_ID must be a positive integer (got "${process.env.E2E_ORG_ID}")`);
}
const API_URL = process.env.E2E_API_URL;

/** Authenticated API call that tolerates empty (204) response bodies. */
const call = async <T = unknown>(
  method: string,
  path: string,
  authFile: string,
  body?: unknown
): Promise<T | null> => {
  const token = await getAccessTokenFromAuthFile(authFile);
  if (!token) {
    throw new Error(`No access token in ${authFile}`);
  }
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Eventuras-Org-Id': String(ORG_ID),
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${method} ${path} → ${response.status} ${await response.text()}`);
  }
  const text = (await response.text()).trim();
  return text ? (JSON.parse(text) as T) : null;
};

/**
 * Bootstrap: grant the admin persona the org-level `Admin` role.
 *
 * The web app resolves `Admin` from backend organization membership — only
 * `SystemAdmin` comes from the token — so being in the Keycloak
 * `eventuras-admins` group isn't enough on its own. We use the global
 * systemadmin (whose `SystemAdmin` token role grants API access) to upsert admin@
 * as an org member with the `Admin` role before the admin specs run.
 *
 * Later: split the suite so a freshly-granted admin performs the event creation
 * as its own flow, separate from this bootstrap step.
 */
setup('grant org Admin role to the admin persona', async () => {
  // The admin persona's own profile gives its backend user id (the user is
  // auto-created on first login).
  const profile = await call<{ id: string }>('GET', '/v3/userprofile', ADMIN_AUTH);
  const userId = profile?.id;
  if (!userId) {
    throw new Error(`Could not resolve backend user id for ${adminEmail()}`);
  }
  logger.info({ userId, orgId: ORG_ID }, 'Granting org Admin role to admin persona');

  // Ensure org membership (idempotent; no body).
  await call('PUT', `/v3/organizations/${ORG_ID}/members/${userId}`, SYSTEMADMIN_AUTH);

  // Assign the Admin role unless it's already there.
  const roles = await call<string[]>(
    'GET',
    `/v3/organizations/${ORG_ID}/members/${userId}/roles`,
    SYSTEMADMIN_AUTH
  );
  if (Array.isArray(roles) && roles.includes('Admin')) {
    // Already granted (e.g. a re-run) — the admin logged in with the role
    // already in place, so its saved session is current. Nothing to refresh.
    logger.info('Admin role already present; admin session is current');
    return;
  }

  await call('POST', `/v3/organizations/${ORG_ID}/members/${userId}/roles`, SYSTEMADMIN_AUTH, {
    role: 'Admin',
  });
  logger.info('Admin role granted; refreshing admin session to reflect it');

  // The admin logged in (setup-admin) before this first-time grant, so its saved
  // session predates the role. Re-login now — only on this fresh-grant path — so
  // tmp/auth/admin.json reflects the new org Admin role for the admin specs.
  await loginPersona(adminEmail(), ADMIN_AUTH);
});

/**
 * The org-admin persona exists so a test can show where an organization's own
 * admin stops. That is only worth anything if the persona really lacks
 * `SystemAdmin` — otherwise every "is denied" assertion built on it passes for
 * the wrong reason, quietly.
 *
 * So these tests pin the persona itself rather than any feature: it is an
 * organization admin, and it is not a system admin.
 */

import { expect, test } from '@playwright/test';

import { ORG_ADMIN_SKIP_REASON, orgAdminEmail } from '../../utils/personas';
import { getAccessTokenFromAuthFile } from '../shared/api-helpers';

const API_URL = process.env.E2E_API_URL;
const ORG_ID = Number.parseInt(process.env.E2E_ORG_ID ?? '1', 10);
const ORGADMIN_AUTH = 'tmp/auth/orgadmin.json';
const SYSTEMADMIN_AUTH = 'tmp/auth/systemadmin.json';

/** Raw fetch: the shared helpers throw on a non-2xx, and the status is the point here. */
const request = async (method: string, path: string, authFile: string, body?: unknown) => {
  const token = await getAccessTokenFromAuthFile(authFile);
  expect(token, `no access token in ${authFile}`).toBeTruthy();

  return fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
};

test.describe('the org-admin persona', () => {
  test.skip(!orgAdminEmail(), ORG_ADMIN_SKIP_REASON);

  test('is an admin of the test organization', async () => {
    const response = await request('GET', '/v3/userprofile', ORGADMIN_AUTH);
    expect(response.ok).toBeTruthy();

    const profile = (await response.json()) as {
      organizationMembership?: { organizationId?: number; roles?: { role?: string }[] }[];
    };

    // Membership of the organization the suite runs against, not of any organization:
    // being an admin somewhere else would say nothing about what happens here.
    const roles = (profile.organizationMembership ?? [])
      .filter(membership => membership.organizationId === ORG_ID)
      .flatMap(membership => (membership.roles ?? []).map(role => role.role));

    expect(roles, `org admin must hold Admin in organization ${ORG_ID}`).toContain('Admin');
  });

  test('is refused a SystemAdmin-only endpoint', async () => {
    // Creating an organization is SystemAdmin-only, and it is refused before
    // anything is written, so this leaves nothing behind.
    const response = await request('POST', '/v3/organizations', ORGADMIN_AUTH, {
      name: 'Org admin persona should not be able to create this',
    });

    expect(response.status, 'org admin must not be able to create organizations').toBe(403);
  });

  test('is a different account from the systemadmin persona', async () => {
    const [orgAdmin, systemAdmin] = await Promise.all([
      request('GET', '/v3/userprofile', ORGADMIN_AUTH).then(r => r.json()),
      request('GET', '/v3/userprofile', SYSTEMADMIN_AUTH).then(r => r.json()),
    ]);

    expect((orgAdmin as { id?: string }).id).toBeTruthy();
    expect((orgAdmin as { id?: string }).id).not.toBe((systemAdmin as { id?: string }).id);
  });
});

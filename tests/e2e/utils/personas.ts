/* eslint no-process-env: 0 */

/**
 * Persona email addresses for the E2E suite.
 *
 * Read from env so no address or domain is baked into the code (update the env
 * when the test realm's seeding changes). Authz is exercised via real logins:
 * the admin/systemadmin addresses map to realm-seeded users in the
 * `eventuras-admins` / `eventuras-systemadmins` groups, while the regular user
 * is auto-created fresh each run. Anonymous = no login (the `web:public`
 * project), so it needs no address here.
 */

import { randomUUID } from 'node:crypto';

const required = (envName: string): string => {
  const value = process.env[envName];
  if (!value) {
    throw new Error(`${envName} must be set`);
  }
  return value;
};

/** Realm-seeded systemadmin (member of `eventuras-systemadmins`). */
export const systemAdminEmail = (): string => required('E2E_SYSTEMADMIN_EMAIL');

/** Realm-seeded admin (member of `eventuras-admins`). */
export const adminEmail = (): string => required('E2E_ADMIN_EMAIL');

/**
 * A fresh, auto-created regular user (no seeding). The env pattern must contain
 * the literal `{random}`, replaced per call so every run gets an isolated
 * recipient — e.g. `E2E_USER_EMAIL_PATTERN=test-{random}@e2e.test.example`.
 */
export const newRegularEmail = (): string => {
  const pattern = required('E2E_USER_EMAIL_PATTERN');
  if (!pattern.includes('{random}')) {
    throw new Error('E2E_USER_EMAIL_PATTERN must contain {random} so each run gets a fresh user');
  }
  return pattern.replaceAll('{random}', randomUUID());
};

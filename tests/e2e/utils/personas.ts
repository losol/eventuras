/* eslint no-process-env: 0 */

/**
 * Persona email addresses for the E2E suite.
 *
 * Read from env so no address or domain is baked into the code (update the env
 * when the test realm's seeding changes). Authz is exercised via real logins
 * against realm-seeded users, while the regular user is auto-created fresh each
 * run. Anonymous = no login (the `web:public` project), so it needs no address.
 *
 * `admin` and `systemadmin` are the same seeded account, which holds both roles:
 * enough to prove a system admin may do something, never that an organization's
 * own admin may not. `orgAdmin` is the account that can show the difference.
 */

import { randomUUID } from 'node:crypto';

const required = (envName: string): string => {
  const value = process.env[envName];
  if (!value) {
    throw new Error(`${envName} must be set`);
  }
  return value;
};

/** Realm-seeded account holding `SystemAdmin`. */
export const systemAdminEmail = (): string => required('E2E_SYSTEMADMIN_EMAIL');

/** Realm-seeded account holding `Admin`; the same account as {@link systemAdminEmail}. */
export const adminEmail = (): string => required('E2E_ADMIN_EMAIL');

/**
 * Realm-seeded account holding `Admin` and deliberately **not** `SystemAdmin`,
 * granted membership of the test organization by the bootstrap setup. Use it
 * wherever a test needs to show that org-level admin rights stop somewhere.
 */
export const orgAdminEmail = (): string => required('E2E_ORGADMIN_EMAIL');

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

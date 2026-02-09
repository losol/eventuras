/**
 * Database schema for Idem IdP
 *
 * Exports all tables for use with Drizzle ORM.
 */

// Account
export * from './account';

// Account claims
export * from './accountClaim';

// OTP authentication
export * from './otp';

// OAuth / OIDC
export * from './oauth';

// RBAC (ADR 0018: Per-Client Role-Based Access Control)
export * from './rbac';

// IdP brokering
export * from './idp';

// OIDC provider storage
export * from './oidc';

// Operations and audit
export * from './operations';

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

// IdP brokering
export * from './idp';

// OIDC provider storage
export * from './oidc';

// Operations and audit
export * from './operations';

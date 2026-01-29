/**
 * Database schema for Idem IdP
 *
 * Exports all tables for use with Drizzle ORM.
 */

// Core tables
export * from './core';

// OTP authentication
export * from './otp';

// User profiles
export * from './profile';

// OAuth / OIDC
export * from './oauth';

// IdP brokering
export * from './idp';

// OIDC provider storage
export * from './oidc';

// Operations and audit
export * from './operations';

// Admin RBAC
export * from './admin';

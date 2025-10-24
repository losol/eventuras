/**
 * Types for the Authentication Store
 *
 * These types are generic and can be used across different applications.
 */

/**
 * Represents a user session with basic information
 */
export type SessionUser = {
  name: string;
  email: string;
  roles: string[];
};

/**
 * Result of checking authentication status
 */
export type AuthStatus = {
  authenticated: boolean;
  user?: SessionUser;
};

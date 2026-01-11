/**
 * Vipps Login Provider Types
 *
 * Type definitions for Vipps Login (OIDC) integration.
 *
 * @see https://developer.vippsmobilepay.com/docs/APIs/login-api/
 */

/**
 * Configuration for Vipps Login client
 */
export interface VippsLoginConfig {
  /** Vipps OIDC issuer URL (e.g., 'https://apitest.vipps.no/access-management-1.0/access') */
  issuer: string;
  /** OAuth Client ID from Vipps */
  clientId: string;
  /** OAuth Client Secret from Vipps */
  clientSecret: string;
  /** OAuth redirect URI (callback URL) */
  redirectUri: string;
  /** OpenID Connect scopes (default: 'openid name phoneNumber address email') */
  scope?: string;
  /** Vipps subscription key (Ocp-Apim-Subscription-Key) - required for userinfo endpoint */
  subscriptionKey?: string;
  /** Merchant serial number - required for userinfo endpoint */
  merchantSerialNumber?: string;
}

/**
 * Vipps address from userinfo endpoint
 */
export interface VippsAddress {
  /** Street address */
  street_address?: string;
  /** Postal code */
  postal_code?: string;
  /** Region/city */
  region?: string;
  /** Country code (e.g., 'NO') */
  country?: string;
  /** Formatted address string */
  formatted?: string;
  /** Address type (e.g., 'home', 'work', 'other') */
  address_type?: string;
}

/**
 * User information returned from Vipps Login userinfo endpoint
 *
 * @see https://developer.vippsmobilepay.com/docs/APIs/login-api/login-api-guide/#userinfo-endpoint
 */
export interface VippsUserInfo {
  /** Subject - unique Vipps user identifier (UUID) */
  sub: string;
  /** Email address */
  email?: string;
  /** Email verification status */
  email_verified?: boolean;
  /** Given name (first name) */
  given_name?: string;
  /** Family name (last name) */
  family_name?: string;
  /** Full name */
  name?: string;
  /** Phone number (with country code, e.g., '4712345678') */
  phone_number?: string;
  /** Phone number verification status */
  phone_number_verified?: boolean;
  /** Birth date (ISO 8601 format, e.g., '1990-01-15') */
  birthdate?: string;
  /** Physical addresses (array) */
  addresses?: VippsAddress[];
  /** Other claims (deprecated) */
  other_addresses?: VippsAddress[];
}

/**
 * Available Vipps Login scopes
 */
export const VippsLoginScopes = {
  /** Required: OpenID Connect base scope */
  OpenId: 'openid',
  /** User's name (given_name, family_name, name) */
  Name: 'name',
  /** Phone number */
  PhoneNumber: 'phoneNumber',
  /** Physical address */
  Address: 'address',
  /** Birth date */
  BirthDate: 'birthDate',
  /** Email address */
  Email: 'email',
} as const;

/**
 * Default scopes for Vipps Login
 */
export const defaultVippsLoginScope = [
  VippsLoginScopes.OpenId,
  VippsLoginScopes.Name,
  VippsLoginScopes.PhoneNumber,
  VippsLoginScopes.Address,
  VippsLoginScopes.Email,
].join(' ');

/**
 * Vipps API environments
 */
export const VippsEnvironments = {
  /** Test environment */
  Test: 'https://apitest.vipps.no',
  /** Production environment */
  Production: 'https://api.vipps.no',
} as const;

/**
 * Get Vipps OIDC issuer URL for environment
 */
export function getVippsIssuer(environment: string): string {
  // Note: Vipps metadata returns issuer with trailing slash
  return `${environment}/access-management-1.0/access/`;
}

/**
 * Type definitions for Payload Vipps Auth Plugin
 */

import type { VippsUserInfo } from '@eventuras/fides-auth/providers/vipps';

/**
 * Configuration options for Vipps authentication plugin
 */
export interface VippsAuthPluginConfig {
  /**
   * Vipps OAuth Client ID (required)
   */
  clientId: string;

  /**
   * Vipps OAuth Client Secret (required)
   */
  clientSecret: string;

  /**
   * OAuth redirect URI / callback URL
   * Optional: If not provided, will be computed from request origin
   * Format: {origin}/api/auth/vipps/callback
   */
  redirectUri?: string;

  /**
   * Vipps API environment
   * @default 'test'
   */
  environment?: 'test' | 'production';

  /**
   * OpenID Connect scopes
   * Default: 'openid name phoneNumber address email'
   */
  scope?: string;

  /**
   * Vipps subscription key (Ocp-Apim-Subscription-Key)
   * Required for userinfo endpoint
   */
  subscriptionKey?: string;

  /**
   * Merchant serial number
   * Required for userinfo endpoint
   */
  merchantSerialNumber?: string;

  /**
   * Whether to disable local (email/password) authentication strategy
   * Default: false
   */
  disableLocalStrategy?: boolean;

  /**
   * Whether the plugin is enabled
   * Default: true
   * Useful for conditionally enabling Vipps auth based on environment
   */
  enabled?: boolean;

  /**
   * Custom mapping function to transform Vipps user data to Payload user fields
   * Allows customization of how Vipps profile data is stored in Payload
   *
   * @param vippsUser - User information from Vipps
   * @returns Partial user object to create/update in Payload
   *
   * @example
   * ```typescript
   * mapVippsUser: (vippsUser) => ({
   *   email: vippsUser.email,
   *   given_name: vippsUser.given_name,
   *   family_name: vippsUser.family_name,
   *   addresses: vippsUser.addresses?.map(addr => ({
   *     label: 'Vipps',
   *     isDefault: true,
   *     ...addr
   *   }))
   * })
   * ```
   */
  mapVippsUser?: (vippsUser: VippsUserInfo) => Partial<any>;
}

/**
 * Resolved configuration with defaults applied
 */
export interface ResolvedVippsAuthConfig
  extends Required<
    Omit<
      VippsAuthPluginConfig,
      | 'mapVippsUser'
      | 'subscriptionKey'
      | 'merchantSerialNumber'
      | 'redirectUri'
      | 'enabled'
      | 'environment'
    >
  > {
  apiUrl: string;
  redirectUri?: string;
  mapVippsUser?: (vippsUser: VippsUserInfo) => Partial<any>;
  subscriptionKey?: string;
  merchantSerialNumber?: string;
}

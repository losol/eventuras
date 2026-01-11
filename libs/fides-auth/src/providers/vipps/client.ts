/**
 * Vipps Login Client
 *
 * Client for Vipps Login (OIDC) authentication flow.
 * Implements OAuth/OIDC operations with PKCE for Vipps.
 */

import { Logger } from '@eventuras/logger';
import * as openid from 'openid-client';

import {
  buildAuthorizationUrl,
  buildPKCEOptions,
  type OAuthConfig,
  type PKCEOptions,
} from '../../oauth';
import {
  defaultVippsLoginScope,
  type VippsLoginConfig,
  type VippsUserInfo,
} from './types';

const logger = Logger.create({
  namespace: 'fides-auth:vipps',
  context: { module: 'VippsLoginClient' },
});

/**
 * Vipps Login Client
 *
 * Handles Vipps Login (OIDC) authentication flow using PKCE.
 */
export class VippsLoginClient {
  private config: VippsLoginConfig;
  private oauthConfig: OAuthConfig;
  private configPromise: Promise<openid.Configuration> | null = null;

  constructor(config: VippsLoginConfig) {
    this.config = {
      ...config,
      scope: config.scope ?? defaultVippsLoginScope,
    };

    this.oauthConfig = {
      issuer: config.issuer,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirect_uri: config.redirectUri,
      scope: this.config.scope!,
    };

    logger.info(
      {
        issuer: config.issuer,
        redirectUri: config.redirectUri,
        scope: this.config.scope,
      },
      'VippsLoginClient initialized'
    );
  }

  /**
   * Get OpenID Configuration (cached)
   * This ensures we use the same Configuration instance across all operations
   */
  private async getConfig(): Promise<openid.Configuration> {
    if (!this.configPromise) {
      this.configPromise = openid.discovery(
        new URL(this.oauthConfig.issuer),
        this.oauthConfig.clientId,
        this.oauthConfig.clientSecret,
        openid.ClientSecretPost(this.oauthConfig.clientSecret)
      );
    }
    return this.configPromise;
  }

  /**
   * Build PKCE options for authorization flow
   *
   * @returns PKCE options including code_verifier, code_challenge, and state
   */
  async buildPKCEOptions(): Promise<PKCEOptions> {
    logger.debug('Building PKCE options');
    return buildPKCEOptions(this.oauthConfig);
  }

  /**
   * Build authorization URL for Vipps Login
   *
   * @param pkceOptions - PKCE options from buildPKCEOptions()
   * @returns Authorization URL to redirect user to
   */
  async buildAuthorizationUrl(pkceOptions: PKCEOptions): Promise<URL> {
    logger.debug('Building authorization URL');
    const config = await this.getConfig();
    return buildAuthorizationUrl(config, pkceOptions);
  }

  /**
   * Exchange authorization code for tokens
   *
   * @param callbackUrl - The full callback URL with code parameter from Vipps
   * @param codeVerifier - PKCE code verifier from initial request
   * @param expectedState - Expected state value for validation (optional)
   * @returns Token response with access_token, id_token, and refresh_token
   */
  async exchangeCodeForTokens(
    callbackUrl: string | URL,
    codeVerifier: string,
    expectedState?: string
  ): Promise<openid.TokenEndpointResponse> {
    logger.debug('Exchanging authorization code for tokens');

    try {
      const config = await this.getConfig();

      // Convert to URL if string
      const currentUrl = typeof callbackUrl === 'string' ? new URL(callbackUrl) : callbackUrl;

      const tokens = await openid.authorizationCodeGrant(config, currentUrl, {
        pkceCodeVerifier: codeVerifier,
        expectedState, // Pass the expected state for validation
        idTokenExpected: true,
      });

      logger.info(
        {
          hasAccessToken: !!tokens.access_token,
          hasRefreshToken: !!tokens.refresh_token,
          hasIdToken: !!tokens.id_token,
          expiresIn: tokens.expires_in,
        },
        'Successfully exchanged code for tokens'
      );

      return tokens;
    } catch (error) {
      logger.error({ error }, 'Failed to exchange code for tokens');
      throw error;
    }
  }

  /**
   * Get user information from Vipps userinfo endpoint
   *
   * @param accessToken - Access token from token exchange
   * @returns Vipps user information
   */
  async getUserInfo(accessToken: string): Promise<VippsUserInfo> {
    logger.debug('Fetching user info from Vipps');

    try {
      const config = await this.getConfig();
      const userinfoUrl = config.serverMetadata().userinfo_endpoint;

      if (!userinfoUrl) {
        throw new Error('Userinfo endpoint not found in OpenID configuration');
      }

      const response = await fetch(userinfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(this.config.subscriptionKey && {
            'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
          }),
          ...(this.config.merchantSerialNumber && {
            'Merchant-Serial-Number': this.config.merchantSerialNumber,
          }),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(
          {
            status: response.status,
            error: errorText,
          },
          'Failed to fetch user info'
        );
        throw new Error(`Failed to fetch user info: ${response.status} - ${errorText}`);
      }

      const userInfo = (await response.json()) as VippsUserInfo;

      logger.info(
        {
          sub: userInfo.sub,
          hasEmail: !!userInfo.email,
          hasPhone: !!userInfo.phone_number,
          hasAddress: !!userInfo.addresses?.length,
        },
        'Successfully fetched user info'
      );

      return userInfo;
    } catch (error) {
      logger.error({ error }, 'Error fetching user info');
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   *
   * @param refreshToken - Refresh token from initial token exchange
   * @returns New token response
   */
  async refreshTokens(refreshToken: string): Promise<openid.TokenEndpointResponse> {
    logger.debug('Refreshing access token');

    try {
      const config = await this.getConfig();
      const tokens = await openid.refreshTokenGrant(config, refreshToken);

      logger.info(
        {
          hasAccessToken: !!tokens.access_token,
          hasRefreshToken: !!tokens.refresh_token,
          expiresIn: tokens.expires_in,
        },
        'Successfully refreshed tokens'
      );

      return tokens;
    } catch (error) {
      logger.error({ error }, 'Failed to refresh tokens');
      throw error;
    }
  }
}

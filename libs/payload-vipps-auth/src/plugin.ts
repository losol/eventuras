/**
 * Vipps Authentication Plugin for Payload CMS
 *
 * Main plugin implementation that adds Vipps Login OAuth endpoints.
 */

import { Logger } from '@eventuras/logger';
import type { Config } from 'payload';
import { resolveConfig } from './config';
import type { VippsAuthPluginConfig } from './types';

const logger = Logger.create({
  namespace: 'payload-vipps-auth:plugin',
  context: { module: 'VippsAuthPlugin' },
});

/**
 * Vipps Authentication Plugin
 *
 * Adds Vipps Login (OpenID Connect) authentication to Payload CMS.
 *
 * @param pluginConfig - Plugin configuration options
 * @returns Payload config plugin function
 *
 * @example
 * ```typescript
 * import { vippsAuthPlugin } from '@eventuras/payload-vipps-auth';
 *
 * export default buildConfig({
 *   plugins: [
 *     vippsAuthPlugin({
 *       clientId: process.env.VIPPS_CLIENT_ID,
 *       clientSecret: process.env.VIPPS_CLIENT_SECRET,
 *       redirectUri: process.env.VIPPS_LOGIN_REDIRECT_URI,
 *       mapVippsUser: (vippsUser) => ({
 *         email: vippsUser.email,
 *         given_name: vippsUser.given_name,
 *         family_name: vippsUser.family_name,
 *         addresses: vippsUser.addresses?.map(addr => ({
 *           label: 'Vipps',
 *           isDefault: true,
 *           ...addr
 *         }))
 *       })
 *     })
 *   ]
 * });
 * ```
 */
export function vippsAuthPlugin(pluginConfig: VippsAuthPluginConfig) {
  return (incomingConfig: Config): Config => {
    // Check if plugin is enabled (default: true)
    const isEnabled = pluginConfig.enabled ?? true;

    if (!isEnabled) {
      logger.info('Vipps authentication plugin is disabled');
      return incomingConfig;
    }

    logger.info('Initializing Vipps authentication plugin');

    // Resolve configuration
    const config = resolveConfig(pluginConfig);

    // Optionally disable local strategy
    if (config.disableLocalStrategy) {
      logger.info('Disabling local authentication strategy');

      const usersCollection = incomingConfig.collections?.find(
        (collection) => collection.slug === 'users'
      );

      if (usersCollection && usersCollection.auth) {
        // Convert auth: true to an object if needed
        if (usersCollection.auth === true) {
          usersCollection.auth = {};
        }
        const auth = usersCollection.auth as any;
        auth.disableLocalStrategy = true;
      }
    }

    logger.info('Vipps authentication plugin initialized');

    return incomingConfig;
  };
}

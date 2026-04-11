/**
 * Configures fides-auth to use @eventuras/logger for all internal logging.
 *
 * Call this once at application startup, before creating the auth store.
 *
 * @example
 * ```typescript
 * import { configureAuthLogger, createAuthStore } from '@eventuras/fides-auth-next/store';
 *
 * configureAuthLogger();
 * const authStore = createAuthStore({ checkAuthStatus });
 * ```
 */

import { configureLogger } from '@eventuras/fides-auth/logger';
import { Logger } from '@eventuras/logger';

export function configureAuthLogger(): void {
  configureLogger({
    create(options) {
      return Logger.create(options);
    },
  });
}

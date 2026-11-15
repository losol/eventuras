import { createAuthStore } from '@eventuras/fides-auth/browser';
import { createAuthStoreHooks } from '@eventuras/fides-auth-react';

import { fidesLogger } from './fidesLogger';

/** The browser's view of the session, from `/api/auth/session`. */
export const authStore = createAuthStore({ adminRole: 'Admin', logger: fidesLogger });

export const { useAuthStore, useAuthActions } = createAuthStoreHooks(authStore);

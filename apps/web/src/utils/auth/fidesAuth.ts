import { createFidesAuth } from '@eventuras/fides-auth-next/auth';

import { oauthConfig, sessionSecret } from '@/utils/oauthConfig';

/** Session helpers and auth route handlers, bound to the app's secret and OIDC config. */
export const auth = createFidesAuth({ secret: sessionSecret, oauthConfig });

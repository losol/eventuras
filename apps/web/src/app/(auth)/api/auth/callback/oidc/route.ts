import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config.server';
import { auth } from '@/utils/auth/fidesAuth';

const logger = Logger.create({ namespace: 'web:auth:callback' });

export async function GET(request: Request): Promise<Response> {
  logger.debug({ path: new URL(request.url).pathname }, 'Handling OIDC callback');
  return auth.handleOidcCallback(request, {
    applicationUrl: appConfig.env.APPLICATION_URL as string,
    rolesClaim: (appConfig.env.OIDC_ROLES_CLAIM as string) || 'roles',
  });
}

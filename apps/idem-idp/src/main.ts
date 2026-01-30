import { createServer } from './server';
import { createOidcProvider } from './oidc/provider';
import { config, validateConfig } from './config';
import { bootstrapKeys } from './crypto/jwks';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:main' });

async function main() {
  logger.info('Starting Idem IdP');

  validateConfig();
  await bootstrapKeys();

  const oidcProvider = await createOidcProvider();
  const app = createServer(oidcProvider);

  app.listen(config.port, () => {
    logger.info({
      issuer: config.issuer,
      port: config.port,
      discoveryEndpoint: `${config.issuer}/.well-known/openid-configuration`
    }, 'Idem IdP listening');
  });
}

main().catch(error => {
  logger.fatal({ error }, 'Startup failed');
  process.exit(1);
});

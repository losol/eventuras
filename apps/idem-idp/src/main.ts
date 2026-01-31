import next from 'next';
import { createServer } from './server';
import { createOidcProvider } from './oidc/provider';
import { config, validateConfig } from './config';
import { bootstrapKeys } from './crypto/jwks';
import { createMailerFromEnv } from '@eventuras/mailer';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:main' });

async function main() {
  logger.info('Starting Idem IdP');

  validateConfig();
  await bootstrapKeys();

  // Initialize mailer
  const mailer = createMailerFromEnv();
  logger.info('Mailer initialized');

  // Initialize Next.js
  const dev = config.nodeEnv === 'development';
  const nextApp = next({ dev, dir: process.cwd() });
  const nextHandler = nextApp.getRequestHandler();

  await nextApp.prepare();
  logger.info('Next.js ready');

  const oidcProvider = await createOidcProvider();
  const app = createServer(oidcProvider, mailer, nextHandler);

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

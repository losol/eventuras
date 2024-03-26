import Fastify, { FastifyInstance } from 'fastify';
import { registerAuthPlugin } from './features/auth';
import { registerPdfFeature } from './features/pdf';
import { registerOpenapiPlugin } from './features/openapi';
import { registerHomepagePlugin } from './features/homepage';

require('dotenv').config()

const start = async () => {
  const fastify: FastifyInstance = Fastify({ logger: true });

  await registerOpenapiPlugin(fastify);
  await registerAuthPlugin(fastify);
  await registerPdfFeature(fastify);
  await registerHomepagePlugin(fastify);

  try {
    // Use process.env.PORT, default to 3100
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3100;

    await fastify.listen({ port: port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

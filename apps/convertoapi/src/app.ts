import Fastify, { FastifyInstance } from 'fastify';
import { registerAuthPlugin } from './features/auth/index.js';
import { registerPdfFeature } from './features/pdf/index.js';
import { registerOpenapiPlugin } from './features/openapi/index.js';
import { registerHomepagePlugin } from './features/homepage/index.js';
import { registerRatelimitPlugin } from './features/ratelimit/index.js';
import dotenv from 'dotenv';

dotenv.config();

const start = async () => {
  const fastify: FastifyInstance = Fastify({ logger: true });

  await registerRatelimitPlugin(fastify);
  await registerOpenapiPlugin(fastify);
  await registerAuthPlugin(fastify);
  await registerPdfFeature(fastify);
  await registerHomepagePlugin(fastify);

  try {
    // Use process.env.PORT, default to 3100
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3100;
    const host = process.env.HOST ? process.env.HOST : '0.0.0.0';

    await fastify.listen({ port: port, host: host });
    console.log(`Server listening on ${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

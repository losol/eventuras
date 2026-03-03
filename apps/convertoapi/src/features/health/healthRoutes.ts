import { FastifyInstance } from 'fastify';

export const healthRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/healthz', async (_request, reply) => {
    reply.send({ status: 'ok' });
  });
};

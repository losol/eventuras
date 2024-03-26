import { FastifyInstance } from 'fastify';
import { pdfRoutes } from './pdfRoutes';

export const registerPdfFeature = (fastify: FastifyInstance) => {
  fastify.register(pdfRoutes);
};

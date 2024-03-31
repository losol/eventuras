import { FastifyInstance } from 'fastify';
import { pdfRoutes } from './pdfRoutes.js';

export const registerPdfFeature = (fastify: FastifyInstance) => {
  fastify.register(pdfRoutes);
};

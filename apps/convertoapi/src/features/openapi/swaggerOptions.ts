
import { SwaggerOptions } from '@fastify/swagger';

export const swaggerOptions: SwaggerOptions = {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Converto API',
      description: 'Making some pdfs...',
      version: '0.1.0'
    },
    servers: [
      {
        url: 'http://localhost:3100',
        description: 'Dev server'
      }
    ],
  },
};

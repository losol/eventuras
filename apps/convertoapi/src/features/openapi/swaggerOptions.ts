import { SwaggerOptions } from '@fastify/swagger';

const url = process.env.base_url || 'http://localhost:3100';

export const swaggerOptions: SwaggerOptions = {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Converto API',
      description: 'Converting to pdf...',
      version: '2.0.0',
    },
    servers: [
      {
        url: new URL(url).toString(),
        description: 'Converto API',
      },
    ],
  },
};

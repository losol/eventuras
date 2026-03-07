import { FastifyInstance, FastifyRequest, FastifyReply, FastifySchema } from 'fastify';
import { HTMLToPDFService } from './pdfService.js';
import { validateUrl } from './urlValidator.js';

const papersizes = [
  'Letter',
  'Legal',
  'Tabloid',
  'Ledger',
  'A0',
  'A1',
  'A2',
  'A3',
  'A4',
  'A5',
  'A6',
];

const pdfGenerateRequestSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      html: { type: 'string', nullable: true },
      url: { type: 'string', format: 'uri', nullable: true },
      scale: { type: 'number', minimum: 0.1, maximum: 2, default: 1 },
      papersize: { type: 'string', enum: papersizes, default: 'A4' },
    },
    oneOf: [
      { required: ['html'], properties: { url: { type: 'null' } } },
      { required: ['url'], properties: { html: { type: 'null' } } },
    ],
  },
  response: {
    200: {
      description: 'PDF generated successfully',
      type: 'object',
      content: {
        'application/pdf': {
          schema: { type: 'string', format: 'binary' },
        },
      },
    },
    400: {
      description: 'Bad request',
      type: 'object',
      properties: { error: { type: 'string' } },
    },
    401: {
      description: 'Unauthorized',
      type: 'object',
      properties: { error: { type: 'string' } },
    },
    422: {
      description: 'Unprocessable',
      type: 'object',
      properties: { error: { type: 'string' } },
    },
    429: {
      description: 'Rate limit exceeded',
      type: 'object',
      properties: { error: { type: 'string' } },
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: { error: { type: 'string' } },
    },
  },
};

async function validatePdfRequest(
  request: FastifyRequest<{ Body: PdfGenerateRequest }>,
  reply: FastifyReply
) {
  const { html, url } = request.body;
  if (html && url) {
    return reply
      .status(422)
      .send({ error: "Cannot specify both 'html' and 'url'. Please provide only one." });
  }
  if (!html && !url) {
    return reply.status(422).send({ error: "Must specify either 'html' or 'url'." });
  }
  if (url) {
    const urlError = await validateUrl(url);
    if (urlError) {
      return reply.status(422).send({ error: urlError });
    }
  }
}

type PdfGenerateRequest = {
  html?: string;
  url?: string;
  scale?: number;
  papersize?: string;
};

async function pdfHandler(
  fastify: FastifyInstance,
  request: FastifyRequest<{ Body: PdfGenerateRequest }>,
  reply: FastifyReply
) {
  const { html, url, scale, papersize } = request.body;
  try {
    let pdfBuffer;
    if (html) {
      fastify.log.info('Generating PDF from HTML');
      pdfBuffer = await HTMLToPDFService.html2pdf(html, scale, papersize);
    } else if (url) {
      fastify.log.info(`Generating PDF from URL: ${request.body.url}`);
      pdfBuffer = await HTMLToPDFService.url2pdf(url, scale, papersize);
    }

    reply.header('Content-Type', 'application/pdf');
    return reply.send(pdfBuffer);
  } catch (error) {
    fastify.log.error({ err: error }, 'Failed to generate PDF');
    if (error instanceof Error) {
      reply.code(500).send({ error: error.message });
    } else {
      reply.code(500).send({ error: 'An unknown error occurred' });
    }
  }
}

export const pdfRoutes = async (fastify: FastifyInstance) => {
  fastify.route({
    method: 'POST',
    url: '/v1/pdf',
    preValidation: [validatePdfRequest],
    preHandler: [fastify.verifyJWT],
    handler: (request, reply) => pdfHandler(fastify, request, reply),
    schema: pdfGenerateRequestSchema,
  });
};

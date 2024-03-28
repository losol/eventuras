import { FastifyInstance } from 'fastify';
import { HTMLToPDFService } from './pdfService.js';
import schema from './schema.js';

export const pdfRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/v1/pdf', {
    preHandler: fastify.verifyJWT,
    handler: async (request, reply) => {
      fastify.log.info({ url: request.url, body: request.body }, 'Received HTML to PDF conversion request');

      const validationResult = schema.safeParse(request.body);
      if (!validationResult.success) {
        // const message = validationResult.error.issues.map((issue: ZodIssue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        fastify.log.warn( 'Validation failed for HTML to PDF conversion request');
        reply.code(400).send("Validation failed");
        return;
      }

      const { html, url, scale, format } = validationResult.data;

      try {
        let pdfBuffer;
        if (html) {
          fastify.log.info('Generating PDF from HTML');
          pdfBuffer = await HTMLToPDFService.html2pdf(html, scale, format);
        } else if (url) {
          fastify.log.info({ url }, 'Generating PDF from URL');
          pdfBuffer = await HTMLToPDFService.url2pdf(url, scale, format);
        }

        reply.header("Content-Type", "application/pdf");
        reply.send(pdfBuffer);
      } catch (error) {
        // Log the error
        fastify.log.error({ err: error }, 'Failed to generate PDF');

        if (error instanceof Error) {
          reply.code(500).send({ error: error.message });
        } else {
          reply.code(500).send({ error: "An unknown error occurred" });
        }
      }
    }
  });
};

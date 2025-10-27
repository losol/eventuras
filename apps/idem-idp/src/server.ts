// Express app (no HTML inline)
import express, { type Application, type Request, type Response } from 'express';
import { renderHomepage } from './views/homepage';

/**
 * Creates the Express app.
 * @returns Application
 */
export function createServer(): Application {
  const app = express();

  // Health probe
  app.get('/healthz', (_req: Request, res: Response) => res.json({ status: 'ok' }));

  // Root page (HTML from view)
  app.get('/', (_req: Request, res: Response) => {
    const name = 'idem-idp';
    const version = process.env.npm_package_version ?? 'dev';
    // Send HTML
    res.type('html').send(renderHomepage({ name, version }));
  });

  return app;
}

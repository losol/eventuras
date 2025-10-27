/**
 * Entry point for Idem-IDP
 *
 * Starts the Express server created in ./server
 * and serves a small HTML homepage from views/homepage.ts.
 */

import { createServer } from './server';
import { renderHomepage } from './views/homepage';

const port = Number(process.env.PORT ?? 3200);
const name = process.env.SERVICE_NAME ?? 'Idem-IDP';
const version = process.env.npm_package_version ?? 'dev';

const app = createServer();

// Simple root route (static HTML)
app.get('/', (_req, res) => {
  res.type('html').send(renderHomepage({ name, version }));
});

// Optional health route if not already in server
app.get('/health', (_req, res) => {
  res.json({ ok: true, name, version });
});

// Start server
app.listen(port, () => {
  console.log(`✅ ${name} listening on http://localhost:${port}`);
});

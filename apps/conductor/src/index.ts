import express, { Request, Response } from 'express';
import { createLogger } from './utils/logger.js';
import { authMiddleware } from './middleware/auth.js';
import { tenantMiddleware } from './middleware/tenant.js';
import { notificationRouter } from './routes/notification.js';
import { register, shutdown } from './instrumentation.js';

const logger = createLogger('conductor:core');

const app = express();
const port = process.env.PORT || 3333;

app.use(express.json());

// Authentication middleware
app.use(authMiddleware);

// Tenant context middleware
app.use(tenantMiddleware);

// Routes
app.use('/notifications', notificationRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Conductor - Smart home messaging orchestration');
});

// Initialize application
register().catch((error) => {
  logger.error({ error }, 'Failed to initialize application');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await shutdown();
  process.exit(0);
});

app.listen(port, () => {
  logger.info({ port }, 'Server started');
  console.log(`Server running at http://localhost:${port}`);
});

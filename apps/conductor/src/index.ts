import express, { Request, Response } from 'express';
import { authMiddleware } from './middleware/auth';
import { tenantMiddleware } from './middleware/tenant';
import { notificationRouter } from './routes/notification';
import { initializeDiscordBot, shutdownDiscordBot } from './channels/discord-bot';

const app = express();
const port = process.env.PORT || 3333;

app.use(express.json());

// Authentication middleware (will validate API key from env for now)
app.use(authMiddleware);

// Tenant context middleware (will use TENANT_ID from env for now)
app.use(tenantMiddleware);

// Routes
app.use('/notifications', notificationRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Domus - Smart home messaging orchestration');
});

// Initialize Discord bot
initializeDiscordBot().catch((error) => {
  console.error('Failed to initialize Discord bot:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await shutdownDiscordBot();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await shutdownDiscordBot();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

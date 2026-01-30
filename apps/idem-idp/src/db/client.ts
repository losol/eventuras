import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';
import { config } from '../config';

/**
 * Database connection configuration
 * Uses centralized config as single source of truth
 */
const connectionString = config.databaseUrl;

/**
 * Create PostgreSQL connection
 */
const queryClient = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
});

/**
 * Drizzle ORM instance
 *
 * This is the main database client for Idem IdP.
 * Import this to execute queries against the database.
 *
 * @example
 * import { db } from './db/client';
 * const accounts = await db.select().from(schema.accounts);
 */
export const db = drizzle(queryClient, { schema });

/**
 * Close database connection
 * Call this on application shutdown
 */
export async function closeDb() {
  await queryClient.end();
}

/**
 * Test setup for Shipper integration tests
 *
 * This file is automatically loaded before each test file.
 * Environment variables are automatically loaded by Vitest from .env file.
 *
 * Note: Vitest loads .env, .env.local, .env.[mode], and .env.[mode].local files
 * from the project root automatically. No need for dotenv package in tests.
 */

import { validateEnvConfig } from '../utils/environment';

// Validate and warn about missing environment variables
validateEnvConfig();

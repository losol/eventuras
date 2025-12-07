/**
 * Configuration for Historia
 *
 * - appConfig: Server-side only (all env vars)
 * - publicEnv: Client and server (NEXT_PUBLIC_* vars)
 */
import path from 'path';

import { createConfig, createEnvironment } from '@eventuras/app-config';

import appConfigJson from '../app.config.json';

// Server-side configuration with full access to all env vars
export const appConfig = createConfig(appConfigJson);

// Client-side public environment variables (NEXT_PUBLIC_*)
// This automatically creates getters for both client and server-side access
export const publicEnv = createEnvironment(path.resolve(process.cwd(), 'app.config.json'));

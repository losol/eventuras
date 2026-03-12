/**
 * Centralized paths for all generated test artifacts.
 * Everything goes under .test-output/ to keep the project root clean.
 */

import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const PROJECT_ROOT = dirname(__filename);

/** Root directory for all generated test artifacts */
export const TEST_OUTPUT_DIR = join(PROJECT_ROOT, '.test-output');

/** Auth state files (admin.json, user.json) */
export const AUTH_DIR = join(TEST_OUTPUT_DIR, 'auth');

/** Shared test state (e.g. createdEvent.json) */
export const STATE_DIR = join(TEST_OUTPUT_DIR, 'state');

/** Playwright test results (traces, screenshots, videos, error context) */
export const RESULTS_DIR = join(TEST_OUTPUT_DIR, 'results');

/** Helper to build auth file paths */
export const authFile = (name: 'admin' | 'user') => join(AUTH_DIR, `${name}.json`);

/** Helper to build state file paths */
export const stateFile = (name: string) => join(STATE_DIR, `${name}.json`);

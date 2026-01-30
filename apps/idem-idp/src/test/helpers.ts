import type { Application } from 'express';
import { createServer } from '../server';
import { createOidcProvider } from '../oidc/provider';

/**
 * Create a test server instance
 * This is a lightweight version that can be used in tests
 */
export async function createTestServer(): Promise<Application> {
  // Create OIDC provider with test configuration
  const oidcProvider = await createOidcProvider();

  // Create Express server with OIDC provider
  const app = createServer(oidcProvider);

  return app;
}

/**
 * Helper to extract JSON from response
 */
export function parseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

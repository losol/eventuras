import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config.server';

const logger = Logger.create({ namespace: 'web:admin:system' });

const BACKEND_TIMEOUT_MS = 5000;

export interface WebVersion {
  version: string;
  gitSha: string;
  buildTime: string;
  imageTag: string;
}

export interface ApiVersion {
  version: string;
  sha: string;
}

/** Build info baked into the web app by next.config.ts / the container build. */
export function getWebVersion(): WebVersion {
  return {
    version: process.env.BUILD_VERSION ?? 'unknown',
    gitSha: process.env.BUILD_GIT_SHA ?? 'unknown',
    buildTime: process.env.BUILD_TIME ?? 'unknown',
    imageTag: process.env.IMAGE_TAG ?? 'unknown',
  };
}

/** Reads the API's anonymous `/v3/diagnostics/version`; null when unreachable. */
export async function getApiVersion(): Promise<ApiVersion | null> {
  const baseUrl = String(appConfig.env.BACKEND_URL ?? '').replace(/\/+$/, '');
  if (!baseUrl) {
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/v3/diagnostics/version`, {
      cache: 'no-store',
      // Same reason as the health check: never let a stalled API hang this page.
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
    if (!response.ok) {
      logger.warn({ status: response.status }, 'Failed to load API version');
      return null;
    }
    const body = (await response.json()) as Partial<ApiVersion>;
    return { version: body.version ?? 'unknown', sha: body.sha ?? 'unknown' };
  } catch (error) {
    logger.error({ error }, 'Error fetching API version');
    return null;
  }
}

import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config.server';
import { getAccessToken } from '@/utils/getAccesstoken';

const logger = Logger.create({ namespace: 'web:admin:health' });

export interface HealthCheck {
  name: string;
  status: string;
  description?: string | null;
  data?: Record<string, unknown> | null;
}

export interface HealthDiagnosticsResult {
  checks: HealthCheck[];
  error: string | null;
}

/** Fetches the API's admin-only `/health/diagnostics` report (server-side). */
export async function getHealthDiagnostics(): Promise<HealthDiagnosticsResult> {
  const token = await getAccessToken();
  const baseUrl = String(appConfig.env.BACKEND_URL ?? '').replace(/\/+$/, '');

  if (!token || !baseUrl) {
    return { checks: [], error: 'Diagnostics unavailable (no token or backend URL).' };
  }

  try {
    const response = await fetch(`${baseUrl}/health/diagnostics`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) {
      logger.warn({ status: response.status }, 'Failed to load health diagnostics');
      return { checks: [], error: `Could not load diagnostics (HTTP ${response.status}).` };
    }
    const report = (await response.json()) as { checks?: HealthCheck[] };
    return { checks: report.checks ?? [], error: null };
  } catch (error) {
    logger.error({ error }, 'Error fetching health diagnostics');
    return { checks: [], error: 'Error loading diagnostics.' };
  }
}

/** Checks that are not Healthy — the problems worth surfacing to an admin. */
export const unhealthyChecks = (checks: HealthCheck[]) =>
  checks.filter(check => check.status !== 'Healthy');

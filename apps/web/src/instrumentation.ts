import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Route fides-auth's server-side logs through @eventuras/logger.
    const { configureAuthLogger } = await import('@eventuras/fides-auth-next/store');
    configureAuthLogger();

    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;

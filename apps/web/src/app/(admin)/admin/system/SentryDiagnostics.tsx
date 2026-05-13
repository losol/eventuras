'use client';

import { useState } from 'react';

import { Button } from '@eventuras/ratio-ui/core/Button';
import { Stack } from '@eventuras/ratio-ui/layout/Stack';

import { triggerWebServerError } from './actions';

/**
 * Admin-only diagnostics for the web app's Sentry integration. Each button
 * exercises a different reporting channel so a single look at GlitchTip
 * confirms that DSN, source maps, release tag, and user context are all
 * wired up correctly.
 */
export const SentryDiagnostics = () => {
  const [clientStatus, setClientStatus] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<string | null>(null);

  const handleClientError = () => {
    setClientStatus('Throwing client-side error — check GlitchTip.');
    throw new Error('Sentry diagnostics: intentional client error');
  };

  const handleServerError = async () => {
    setServerStatus('Calling server action that throws…');
    try {
      await triggerWebServerError();
      setServerStatus('No error thrown — something is wrong with the action.');
    } catch (error) {
      setServerStatus(
        `Server action rejected as expected (${
          error instanceof Error ? error.message : 'unknown error'
        }) — check GlitchTip.`
      );
    }
  };

  return (
    <Stack gap="md">
      <div>
        <Button onClick={handleClientError} variant="outline">
          Throw client-side error
        </Button>
        {clientStatus && <p className="mt-2 text-sm">{clientStatus}</p>}
      </div>
      <div>
        <Button onClick={handleServerError} variant="outline">
          Throw server-side error
        </Button>
        {serverStatus && <p className="mt-2 text-sm">{serverStatus}</p>}
      </div>
    </Stack>
  );
};

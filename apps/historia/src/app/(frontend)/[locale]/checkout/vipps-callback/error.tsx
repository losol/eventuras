'use client';

import { useEffect } from 'react';

import { Logger } from '@eventuras/logger';
import { Error } from '@eventuras/ratio-ui/blocks/Error';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Container } from '@eventuras/ratio-ui/layout/Container';

const logger = Logger.create({
  namespace: 'historia:payment',
  context: { module: 'PaymentCallbackError' },
});

export default function VippsCallbackError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error({ error: error.message, digest: error.digest }, 'Payment callback error');
  }, [error]);

  return (
    <Container padding="px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Card>
          <Error tone="error" type="generic">
            <Error.Title>Noe gikk galt</Error.Title>
            <Error.Description>
              Vi kunne ikke behandle betalingen din. Vennligst prøv igjen eller kontakt support.
            </Error.Description>
            <Error.Actions>
              <Button onClick={() => reset()} variant="primary">
                Prøv igjen
              </Button>
              <Button onClick={() => window.location.href = '/no'} variant="secondary">
                Tilbake til forsiden
              </Button>
            </Error.Actions>
          </Error>
        </Card>
      </div>
    </Container>
  );
}

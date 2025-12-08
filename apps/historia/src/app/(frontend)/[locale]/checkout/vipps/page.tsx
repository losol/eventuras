import { Suspense } from 'react';

import { Card } from '@eventuras/ratio-ui/core/Card';
import { Loading } from '@eventuras/ratio-ui/core/Loading';
import { Container } from '@eventuras/ratio-ui/layout/Container';

import VippsCheckoutPage from './page.client';

export default function VippsCheckoutPageWrapper() {
  return (
    <Suspense
      fallback={
        <Container padding="px-4 py-16">
          <div className="mx-auto max-w-2xl">
            <Card>
              <div className="flex justify-center py-12">
                <Loading />
              </div>
            </Card>
          </div>
        </Container>
      }
    >
      <VippsCheckoutPage />
    </Suspense>
  );
}

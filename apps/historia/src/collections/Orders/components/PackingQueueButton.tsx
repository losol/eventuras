'use client';

import React from 'react';
import { Button } from '@payloadcms/ui';
import { useRouter } from 'next/navigation';

export function PackingQueueButton() {
  const router = useRouter();

  return (
    <div style={{ marginBottom: 'var(--base)' }}>
      <Button
        onClick={() => router.push('/admin/collections/orders/packing-queue')}
        buttonStyle="primary"
        icon="list"
      >
        📦 View Packing Queue
      </Button>
    </div>
  );
}

'use client';

import React from 'react';
import { Button } from '@payloadcms/ui';
import Link from 'next/link';

export function OrdersDescription() {
  return (
    <div style={{ marginBottom: 'var(--base)', display: 'flex', gap: 'var(--base)' }}>
      <Button el="link" Link={Link} to="/admin/packing-queue" buttonStyle="secondary">
        View Packing Queue
      </Button>
      <Button el="link" Link={Link} to="/admin/sales-report" buttonStyle="secondary">
        Sales Report
      </Button>
    </div>
  );
}

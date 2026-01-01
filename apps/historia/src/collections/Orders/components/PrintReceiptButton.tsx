'use client';

import React from 'react';
import { Button } from '@payloadcms/ui';
import { useDocumentInfo } from '@payloadcms/ui';

export function PrintReceiptButton() {
  const { id } = useDocumentInfo();

  const handlePrint = () => {
    if (!id) return;
    window.open(`/admin/orders/${id}/receipt`, '_blank');
  };

  if (!id) return null;

  return (
    <Button
      buttonStyle="secondary"
      size="small"
      onClick={handlePrint}
    >
      🧾 Print kvittering
    </Button>
  );
}

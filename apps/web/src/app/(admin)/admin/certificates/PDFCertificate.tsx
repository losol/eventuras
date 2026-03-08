'use client';
import { useState } from 'react';

import { Button } from '@eventuras/ratio-ui/core/Button';

export const PDFCertificate = (props: { certificateId: number | string }) => {
  const [loading, setIsLoading] = useState(false);
  return (
    <Button
      loading={loading}
      onClick={async () => {
        setIsLoading(true);
        try {
          const result = await fetch(`/api/certificates/${props.certificateId}/pdf`, {
            headers: {
              Accept: 'application/pdf',
            },
          });
          if (!result.ok) {
            throw new Error(`Failed to fetch PDF: ${result.status}`);
          }
          const blob = await result.blob();
          const fileURL = URL.createObjectURL(blob);
          window.open(fileURL);
          setTimeout(() => URL.revokeObjectURL(fileURL), 60000);
        } finally {
          setIsLoading(false);
        }
      }}
    >
      Open PDF
    </Button>
  );
};

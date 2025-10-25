'use client';
import { useState } from 'react';

import { Button } from '@eventuras/ratio-ui/core/Button';

import { publicEnv } from '@/config.client';

export const PDFCertificate = (props: { certificateId: number | string }) => {
  const [loading, setIsLoading] = useState(false);
  return (
    <Button
      loading={loading}
      onClick={async () => {
        setIsLoading(true);
        const result = await fetch(
          `${publicEnv.NEXT_PUBLIC_BACKEND_URL}/v3/certificates/${props.certificateId}?format=Pdf`,
          {
            headers: {
              Accept: 'application/pdf',
            },
          }
        );
        const blob = await result.blob();
        setIsLoading(false);
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL);
      }}
    >
      Open PDF
    </Button>
  );
};

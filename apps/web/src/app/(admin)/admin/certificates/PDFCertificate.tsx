'use client';
import { useState } from 'react';

import { Button } from '@eventuras/ratio-ui/core/Button';

export const PDFCertificate = (props: { certificateId: number | string; backendUrl: string }) => {
  const [loading, setIsLoading] = useState(false);
  return (
    <Button
      loading={loading}
      onClick={async () => {
        setIsLoading(true);
        const result = await fetch(
          `${props.backendUrl}/v3/certificates/${props.certificateId}?format=Pdf`,
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

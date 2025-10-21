'use client';

import { Button } from '@eventuras/ratio-ui';
import { useState } from 'react';

import Environment from '@/utils/Environment';

export const PDFCertificate = (props: { certificateId: number | string }) => {
  const [loading, setIsLoading] = useState(false);

  return (
    <Button
      loading={loading}
      onClick={async () => {
        setIsLoading(true);
        const result = await fetch(
          `${Environment.NEXT_PUBLIC_API_BASE_URL}/v3/certificates/${props.certificateId}?format=Pdf`,
          {
            headers: {
              Accept: 'application/pdf',
            },
          }
        );
        const blob = await result?.blob()!;
        setIsLoading(false);
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL);
      }}
    >
      Open PDF
    </Button>
  );
};

'use client';
import { useState } from 'react';

import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';

const logger = Logger.create({
  namespace: 'web:admin:events',
  context: { component: 'ExcelExportButton' },
});
import { publicEnv } from '@/config.client';
export const ExcelExportButton = (props: { EventinfoId: number }) => {
  const [loading, setIsLoading] = useState(false);
  const downloadExcelFile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${publicEnv.NEXT_PUBLIC_BACKEND_URL}/v3/registrations?EventId=${props.EventinfoId}`,
        {
          headers: {
            Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to download the Excel file');
      }
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Received empty blob for Excel file');
      }
      const fileURL = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = 'Registrations.xlsx'; // Specify the download filename
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      // Add a slight delay to ensure the download starts
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(fileURL);
      }, 500);
    } catch (error) {
      logger.error({ error }, 'Error downloading Excel file');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button loading={loading} onClick={downloadExcelFile}>
      Excel
    </Button>
  );
};

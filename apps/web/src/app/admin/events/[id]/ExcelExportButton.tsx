'use client';

import { Button } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/utils';
import { useState } from 'react';

import Environment from '@/utils/Environment';

export const ExcelExportButton = (props: { EventinfoId: number }) => {
  const [loading, setIsLoading] = useState(false);

  const downloadExcelFile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${Environment.NEXT_PUBLIC_API_BASE_URL}/v3/registrations?EventId=${props.EventinfoId}`,
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
      Logger.error({ namespace: 'ExcelExporter' }, 'Error downloading Excel file:', error);
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

'use client';
import { useState } from 'react';

import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { useToast } from '@eventuras/ratio-ui/toast';

import type { RegistrationStatus } from '@/lib/eventuras-sdk';

import { downloadRegistrationsExcel } from './excelExportActions';

const logger = Logger.create({
  namespace: 'web:admin:events',
  context: { component: 'ExcelExportButton' },
});

export const ExcelExportButton = (props: {
  EventinfoId: number;
  statuses?: RegistrationStatus[];
  disabled?: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const downloadExcelFile = async () => {
    setLoading(true);
    try {
      logger.info({ eventId: props.EventinfoId }, 'Initiating Excel download');

      const result = await downloadRegistrationsExcel(props.EventinfoId, props.statuses);

      if (!result.success) {
        logger.error(
          { eventId: props.EventinfoId, error: result.error },
          'Failed to download Excel file'
        );
        toast.error(result.error.message || 'Failed to download Excel file');
        return;
      }

      // Convert base64 back to blob
      const binaryString = atob(result.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.codePointAt(i) ?? 0;
      }
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Create download link
      const fileURL = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `Registrations-Event-${props.EventinfoId}.xlsx`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(fileURL);
      }, 500);

      logger.info({ eventId: props.EventinfoId }, 'Excel file downloaded successfully');
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      logger.error({ error, eventId: props.EventinfoId }, 'Error downloading Excel file');
      toast.error('An unexpected error occurred while downloading the file');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button loading={loading} disabled={props.disabled} onClick={downloadExcelFile}>
      Excel
    </Button>
  );
};

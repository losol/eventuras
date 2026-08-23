'use client';
import { useState } from 'react';

import { Logger } from '@eventuras/logger';
import { useToast } from '@eventuras/ratio-ui/toast';

import type { RegistrationStatus } from '@/lib/eventuras-sdk';

import { downloadRegistrationsExcel } from './excelExportActions';

const logger = Logger.create({
  namespace: 'web:admin:events',
  context: { module: 'useExcelExport' },
});

export type ExcelExportOptions = {
  statuses?: RegistrationStatus[];
  /** Defaults to `Registrations-Event-{eventId}.xlsx`. */
  filename?: string;
};

/**
 * Fetches the registrations Excel file through the server action and hands it
 * to the browser as a download. Resolves to the filename on success, null on
 * failure (already reported via toast).
 */
export function useExcelExport(eventId: number) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const download = async ({ statuses, filename }: ExcelExportOptions = {}) => {
    const name = filename ?? `Registrations-Event-${eventId}.xlsx`;
    setLoading(true);
    try {
      logger.info({ eventId, statuses }, 'Initiating Excel download');

      const result = await downloadRegistrationsExcel(eventId, statuses);

      if (!result.success) {
        logger.error({ eventId, error: result.error }, 'Failed to download Excel file');
        toast.error(result.error.message || 'Failed to download Excel file');
        return null;
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
      link.download = name;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(fileURL);
      }, 500);

      logger.info({ eventId, filename: name }, 'Excel file downloaded successfully');
      return name;
    } catch (error) {
      logger.error({ error, eventId }, 'Error downloading Excel file');
      toast.error('An unexpected error occurred while downloading the file');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { download, loading };
}

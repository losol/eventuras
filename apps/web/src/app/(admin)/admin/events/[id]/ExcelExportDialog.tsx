'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@eventuras/ratio-ui/core/Button';
import { Text } from '@eventuras/ratio-ui/core/Text';
import {
  ToggleButtonGroup,
  type ToggleButtonOption,
} from '@eventuras/ratio-ui/core/ToggleButtonGroup';
import { Dialog } from '@eventuras/ratio-ui/layout/Dialog';
import { Stack } from '@eventuras/ratio-ui/layout/Stack';

import type { ByStatus, EventDto, EventStatisticsDto } from '@/lib/eventuras-sdk';
import { RegistrationStatus } from '@/lib/eventuras-types';

import { useExcelExport } from './useExcelExport';

// Display order; `byStatus` keys are the camel-cased status names.
const STATUSES: { status: RegistrationStatus; countKey: keyof ByStatus; labelKey: string }[] = [
  { status: RegistrationStatus.DRAFT, countKey: 'draft', labelKey: 'draft' },
  { status: RegistrationStatus.VERIFIED, countKey: 'verified', labelKey: 'verified' },
  { status: RegistrationStatus.ATTENDED, countKey: 'attended', labelKey: 'attended' },
  { status: RegistrationStatus.NOT_ATTENDED, countKey: 'notAttended', labelKey: 'notAttended' },
  { status: RegistrationStatus.FINISHED, countKey: 'finished', labelKey: 'finished' },
  { status: RegistrationStatus.WAITING_LIST, countKey: 'waitingList', labelKey: 'waitingList' },
  { status: RegistrationStatus.CANCELLED, countKey: 'cancelled', labelKey: 'cancelled' },
];

const DEFAULT_SELECTION = STATUSES.map(s => s.status).filter(
  s => s !== RegistrationStatus.CANCELLED
);

type ExcelExportDialogProps = {
  event: EventDto;
  statistics: EventStatisticsDto;
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Excel export as a task: pick the registration statuses (with counts),
 * download, and see the filename that landed. Replaces the old export tab.
 */
export default function ExcelExportDialog({
  event,
  statistics,
  isOpen,
  onClose,
}: Readonly<ExcelExportDialogProps>) {
  const t = useTranslations();
  const eventId = event.id!;
  const { download, loading } = useExcelExport(eventId);
  const [selected, setSelected] = useState<Set<RegistrationStatus>>(new Set(DEFAULT_SELECTION));
  const [downloadedFile, setDownloadedFile] = useState<string | null>(null);

  const options: ToggleButtonOption[] = STATUSES.map(s => ({
    value: s.status,
    label: t(`common.registrations.labels.${s.labelKey}`),
    count: statistics.byStatus?.[s.countKey] ?? 0,
  }));

  const rowCount = STATUSES.filter(s => selected.has(s.status)).reduce(
    (sum, s) => sum + (statistics.byStatus?.[s.countKey] ?? 0),
    0
  );
  const rowsLabel = t('admin.events.export.rows', { count: rowCount });

  // Reset fully on close so a reopen starts from the default selection.
  const close = () => {
    onClose();
    setDownloadedFile(null);
    setSelected(new Set(DEFAULT_SELECTION));
  };

  const run = async () => {
    const filename = await download({
      statuses: [...selected],
      filename: `${event.slug || `event-${eventId}`}-registrations.xlsx`,
    });
    if (filename) setDownloadedFile(filename);
  };

  return (
    <Dialog isOpen={isOpen} onClose={close} size="lg" testId="excel-export-dialog">
      <Dialog.Heading>{t('admin.events.export.title')}</Dialog.Heading>
      <Dialog.Content>
        {downloadedFile ? (
          <Stack gap="sm">
            <Text as="p">{t('admin.events.export.done')}</Text>
            <Text
              as="p"
              family="mono"
              size="sm"
              variant="muted"
              className="rounded border border-border-1 bg-card px-3 py-2"
              testId="excel-export-filename"
            >
              {downloadedFile}
            </Text>
            <Text as="p" size="sm" variant="subtle">
              {rowsLabel}
            </Text>
          </Stack>
        ) : (
          <Stack gap="md">
            <Text as="p" size="sm" variant="muted">
              {t('admin.events.export.description')}
            </Text>
            <ToggleButtonGroup
              aria-label={t('common.labels.participationStatus')}
              size="sm"
              selectionMode="multiple"
              options={options}
              selectedKeys={selected}
              onSelectionChange={keys => setSelected(new Set([...keys] as RegistrationStatus[]))}
              className="flex-wrap"
              testId="excel-export-statuses"
            />
            {selected.size === 0 ? (
              <div role="alert">
                <Text as="p" size="sm" color="error">
                  {t('admin.events.export.noStatusesSelected')}
                </Text>
              </div>
            ) : (
              <Text as="p" size="sm" variant="subtle">
                {rowsLabel}
              </Text>
            )}
          </Stack>
        )}
      </Dialog.Content>
      <Dialog.Footer>
        {downloadedFile ? (
          <Button variant="outline" onClick={close}>
            {t('admin.events.export.finish')}
          </Button>
        ) : (
          <>
            <Button variant="text" onClick={close}>
              {t('common.buttons.cancel')}
            </Button>
            <Button
              variant="primary"
              loading={loading}
              disabled={selected.size === 0}
              onClick={run}
              testId="excel-export-download"
            >
              {t('admin.events.export.download')}
            </Button>
          </>
        )}
      </Dialog.Footer>
    </Dialog>
  );
}

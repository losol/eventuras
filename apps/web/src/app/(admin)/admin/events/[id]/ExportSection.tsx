'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Checkbox } from '@eventuras/ratio-ui/forms';

import { RegistrationStatus } from '@/lib/eventuras-types';

import { ExcelExportButton } from './ExcelExportButton';

const ALL_STATUSES = Object.values(RegistrationStatus);

/**
 * Export tab: pick which registration statuses go into the Excel export.
 * Uses plain controlled checkboxes — this renders inside the event edit form,
 * and must not register fields into it.
 */
export default function ExportSection({ eventId }: Readonly<{ eventId: number }>) {
  const t = useTranslations();
  const [selected, setSelected] = useState<RegistrationStatus[]>(
    ALL_STATUSES.filter(status => status !== RegistrationStatus.CANCELLED)
  );

  const toggle = (status: RegistrationStatus) => {
    setSelected(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const statusLabels: Record<RegistrationStatus, string> = {
    [RegistrationStatus.DRAFT]: t('common.registrations.labels.draft'),
    [RegistrationStatus.CANCELLED]: t('common.registrations.labels.cancelled'),
    [RegistrationStatus.VERIFIED]: t('common.registrations.labels.verified'),
    [RegistrationStatus.NOT_ATTENDED]: t('common.registrations.labels.notAttended'),
    [RegistrationStatus.ATTENDED]: t('common.registrations.labels.attended'),
    [RegistrationStatus.FINISHED]: t('common.registrations.labels.finished'),
    [RegistrationStatus.WAITING_LIST]: t('common.registrations.labels.waitingList'),
  };

  return (
    <section className="py-6">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        {t('admin.events.export.description')}
      </p>

      <div className="my-4 space-y-2">
        {ALL_STATUSES.map(status => (
          <Checkbox
            key={status}
            id={`export-status-${status}`}
            checked={selected.includes(status)}
            onChange={() => toggle(status)}
            testId={`export-status-${status}`}
          >
            <label htmlFor={`export-status-${status}`} className="cursor-pointer">
              {statusLabels[status]}
            </label>
          </Checkbox>
        ))}
      </div>

      {selected.length === 0 && (
        <p role="alert" className="my-2 text-sm text-red-500">
          {t('admin.events.export.noStatusesSelected')}
        </p>
      )}

      <ExcelExportButton
        EventinfoId={eventId}
        statuses={selected}
        disabled={selected.length === 0}
      />
    </section>
  );
}

'use client';

import { useTranslations } from 'next-intl';

import { ToggleButtonGroup, ToggleButtonOption } from '@eventuras/ratio-ui/core/ToggleButtonGroup';

import { EventStatisticsDto } from '@/lib/eventuras-sdk';
import { ParticipationTypes, ParticipationTypesKey } from '@/types';

type EventStatisticsProps = {
  statistics: EventStatisticsDto;
  highlightedSelection?: string | null;
  onSelectionChanged?: (selection: string) => void;
};

const EventStatistics: React.FC<EventStatisticsProps> = ({
  statistics,
  onSelectionChanged,
  highlightedSelection,
}) => {
  const t = useTranslations();
  const byStatus = statistics ? statistics.byStatus : null;

  const counts = {
    [ParticipationTypes.active]:
      (byStatus?.draft ?? 0) +
      (byStatus?.verified ?? 0) +
      (byStatus?.attended ?? 0) +
      (byStatus?.finished ?? 0) +
      (byStatus?.notAttended ?? 0),
    [ParticipationTypes.waitingList]: byStatus?.waitingList ?? 0,
    [ParticipationTypes.cancelled]: byStatus?.cancelled ?? 0,
  };

  const options: ToggleButtonOption[] = Object.keys(ParticipationTypes).map((key: string) => {
    const k = key as ParticipationTypesKey;
    return {
      value: key,
      label: t(`common.labels.${key}`),
      count: counts[k],
    };
  });

  const handleChange = (value: string | string[] | null) => {
    if (onSelectionChanged) {
      // Convert null or empty string to empty string for deselection
      onSelectionChanged((value as string) || '');
    }
  };

  return (
    <ToggleButtonGroup
      options={options}
      value={highlightedSelection || null}
      onChange={handleChange}
      aria-label={t('common.labels.participationStatus')}
    />
  );
};

export default EventStatistics;

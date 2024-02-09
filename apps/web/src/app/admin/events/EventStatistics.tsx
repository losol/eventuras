'use client';
import { EventStatisticsDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';

import NumberCard from '@/components/ui/NumberCard';
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
  const { t } = createTranslation();
  const byStatus = statistics ? statistics.byStatus : null;
  const counts = {
    [ParticipationTypes.participants]:
      (byStatus?.draft ?? 0) +
      (byStatus?.verified ?? 0) +
      (byStatus?.attended ?? 0) +
      (byStatus?.finished ?? 0) +
      (byStatus?.notAttended ?? 0),
    [ParticipationTypes.waitingList]: byStatus?.waitingList ?? 0,
    [ParticipationTypes.cancelled]: byStatus?.cancelled ?? 0,
  };

  const toggleSelection = (currentSelection: ParticipationTypes) => {
    onSelectionChanged && onSelectionChanged(currentSelection);
  };

  return (
    <div className="grid gap-1 grid-cols-3  md:grid-cols-4 break-words">
      {Object.keys(ParticipationTypes).map((key: string) => {
        const k = key as ParticipationTypesKey;
        const className = highlightedSelection === key ? 'font-bold border' : '';
        return (
          <button
            title={t(`common:labels.${key}`)}
            key={key}
            onClick={() => toggleSelection(ParticipationTypes[k])}
            className={className}
          >
            <NumberCard number={counts[k]} label={t(`common:labels.${key}`)} />
          </button>
        );
      })}
    </div>
  );
};

export default EventStatistics;

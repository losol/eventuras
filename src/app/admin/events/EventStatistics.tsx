import { EventStatisticsDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';

import NumberCard from '@/components/ui/NumberCard';

type EventStatisticsProps = {
  statistics: EventStatisticsDto;
};

const EventStatistics: React.FC<EventStatisticsProps> = ({ statistics }) => {
  const { t } = createTranslation();
  const { byStatus } = statistics;

  const counts = {
    participants:
      (byStatus?.draft ?? 0) +
      (byStatus?.verified ?? 0) +
      (byStatus?.attended ?? 0) +
      (byStatus?.finished ?? 0) +
      (byStatus?.notAttended ?? 0),
    waitingList: byStatus?.waitingList ?? 0,
    cancelled: byStatus?.cancelled ?? 0,
  };

  return (
    <div className="grid gap-1 grid-cols-3  md:grid-cols-4 break-words">
      <NumberCard number={counts.participants} label={t('common:labels.participants')} />
      <NumberCard number={counts.waitingList} label={t('common:labels.waitingList')} />
      <NumberCard number={counts.cancelled} label={t('common:labels.cancelled')} />
    </div>
  );
};

export default EventStatistics;

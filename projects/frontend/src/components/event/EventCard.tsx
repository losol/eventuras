import { EventDto } from '@losol/eventuras';
import Link from 'next/link';

import Card from '@/components/ui/Card';
import Environment from '@/utils/Environment';
import { formatDateSpan } from '@/utils/formatDate';

interface EventCardProps {
  eventinfo: EventDto;
}

const EventCard: React.FC<EventCardProps> = ({ eventinfo }) => {
  return (
    <Card className="p-3 bg-white dark:bg-slate-900 hover:bg-primary-100  dark:hover:bg-primary-900 transform transition duration-300 ease-in-out">
      {eventinfo.title && (
        <Card.Heading spacingClassName="py-3">
          <Link href={`/events/${eventinfo.id}/${eventinfo.slug}`} className="stretched-link">
            {eventinfo.title}
          </Link>
        </Card.Heading>
      )}
      {eventinfo.description && <Card.Text>{eventinfo.description}</Card.Text>}
      {eventinfo.location && <Card.Text>{eventinfo.location}</Card.Text>}
      <Card.Text>
        {formatDateSpan(eventinfo.dateStart as string, eventinfo.dateEnd as string, {
          locale: Environment.NEXT_PUBLIC_DEFAULT_LOCALE,
        })}
      </Card.Text>
    </Card>
  );
};

export default EventCard;

import { MarkdownContent } from '@eventuras/markdown';
import { EventDto } from '@eventuras/sdk';

import { Card } from '@eventuras/ratio-ui/core/Card';
import Environment from '@/utils/Environment';
import { formatDateSpan } from '@/utils/formatDate';
import Link from '../BaseLink';
import Heading from '@eventuras/ratio-ui/core/Heading/Heading';
import Text from '@eventuras/ratio-ui/core/Text/Text';
import { Calendar, MapPin } from 'lucide-react';

interface EventCardProps {
  eventinfo: EventDto;
}

const EventCard: React.FC<EventCardProps> = ({ eventinfo }) => {
  return (
    <Card>
      {eventinfo.title && (
        <Heading as="h4" padding="pt-3">
          <Link href={`/events/${eventinfo.id}/${eventinfo.slug}`} linkOverlay>
            {eventinfo.title}a asdf
          </Link>
        </Heading>
      )}
      {eventinfo.description && (
        <Text padding="py-3">
          <MarkdownContent markdown={eventinfo.description} />
        </Text>
      )}
      {eventinfo.location && (
        <Text icon={<MapPin size={16} />} padding="pt-1">
          {eventinfo.location}
        </Text>
      )}
      <Text icon={<Calendar size={16} />} padding="pt-1">
        {formatDateSpan(eventinfo.dateStart as string, eventinfo.dateEnd as string, {
          locale: Environment.NEXT_PUBLIC_DEFAULT_LOCALE,
        })}
      </Text>
    </Card>
  );
};

export default EventCard;

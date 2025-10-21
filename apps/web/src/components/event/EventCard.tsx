import { MarkdownContent } from '@eventuras/markdown';
import { EventDto } from '@eventuras/event-sdk';

import { Card } from '@eventuras/ratio-ui/core/Card';
import { appConfig } from '@/config.server';
import { formatDateSpan } from '@eventuras/core/datetime';
import { Link } from '@eventuras/ratio-ui-next/Link';
import {Heading} from '@eventuras/ratio-ui/core/Heading';
import {Text} from '@eventuras/ratio-ui/core/Text';
import { Calendar, MapPin } from '@eventuras/ratio-ui/icons';

interface EventCardProps {
  eventinfo: EventDto;
}

const EventCard: React.FC<EventCardProps> = ({ eventinfo }) => {
  return (
    <Card>
      {eventinfo.title && (
        <Heading as="h4" padding="pt-3">
          <Link href={`/events/${eventinfo.id}/${eventinfo.slug}`} linkOverlay>
            {eventinfo.title}
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
          locale: appConfig.env.NEXT_PUBLIC_DEFAULT_LOCALE as string,
        })}
      </Text>
    </Card>
  );
};

export default EventCard;

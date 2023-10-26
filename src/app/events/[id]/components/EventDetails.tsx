import { EventDto } from '@losol/eventuras';
import useTranslation from 'next-translate/useTranslation';

import EventContent from '@/components/event/EventContent';
import Heading from '@/components/ui/Heading';
import Image from '@/components/ui/Image';

import EventRegistrationButton from './EventRegistrationButton';

type EventProps = {
  eventinfo: EventDto;
};

export default function EventDetails({ eventinfo }: EventProps) {
  const { t } = useTranslation('events');

  return (
    <>
      <Heading>{eventinfo?.title ?? 'Mysterious event'}</Heading>

      {eventinfo?.featuredImageUrl ? (
        <Image
          src={eventinfo.featuredImageUrl}
          alt=""
          width={600}
          height={400}
          caption={eventinfo?.featuredImageCaption ?? ''}
        />
      ) : null}
      <EventContent event={eventinfo} contentField="description" heading={t('Description')} />
      <EventRegistrationButton eventId={eventinfo.id!} />
      <EventContent
        event={eventinfo}
        contentField="moreInformation"
        heading={t('More information')}
      />
      <EventContent event={eventinfo} contentField="program" heading={t('Program')} />
      <EventContent
        event={eventinfo}
        contentField="practicalInformation"
        heading={t('Practical information')}
      />
    </>
  );
}

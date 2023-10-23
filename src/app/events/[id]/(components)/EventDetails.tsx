import { EventDto } from '@losol/eventuras';
import { compiler } from 'markdown-to-jsx';
import useTranslation from 'next-translate/useTranslation';

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
      {eventinfo?.description ? (
        <>
          <Heading as="h2">{t('Description')}</Heading>
          {eventinfo.description ? compiler(eventinfo.description) : null}
        </>
      ) : null}

      <EventRegistrationButton eventId={eventinfo.id!} />

      {eventinfo?.moreInformation ? (
        <>
          <Heading as="h2">{t('More information')}</Heading>
          {eventinfo.moreInformation ? compiler(eventinfo.moreInformation) : null}
        </>
      ) : null}

      {eventinfo?.program ? (
        <>
          <Heading as="h2">{t('Program')}</Heading>
          {eventinfo.program ? compiler(eventinfo.program) : null}
        </>
      ) : null}

      {eventinfo?.practicalInformation ? (
        <>
          <Heading as="h2">{t('Practical information')}</Heading>
          {eventinfo.practicalInformation ? compiler(eventinfo.practicalInformation) : null}
        </>
      ) : null}
    </>
  );
}

import { EventDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';

import Heading from '@/components/ui/Heading';
import Image from '@/components/ui/Image';
import MarkdownContent from '@/components/ui/MarkdownContent';

import EventRegistrationButton from './EventRegistrationButton';

type EventProps = {
  eventinfo: EventDto;
};

export default function EventDetails({ eventinfo }: EventProps) {
  const { t } = createTranslation();

  if (!eventinfo) return <div>{t('common:events.event-not-found')}</div>;

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
      <EventRegistrationButton eventId={eventinfo.id!} />

      <MarkdownContent markdown={eventinfo.description} heading={t('common:events.description')} />
      <MarkdownContent
        markdown={eventinfo.moreInformation}
        heading={t('common:events.moreinformation')}
      />
      <MarkdownContent markdown={eventinfo.program} heading={t('common:events.program')} />
      <MarkdownContent
        markdown={eventinfo.practicalInformation}
        heading={t('common:events.practicalinformation')}
      />
    </>
  );
}

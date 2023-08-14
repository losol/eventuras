import { EventDto } from '@losol/eventuras';
import { Heading, Image } from 'components/content';
import parse from 'html-react-parser';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

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

      {eventinfo?.description ?? null}

      <div>
        <Link href={`/events/${eventinfo.id}/register`}>Register for event</Link>
      </div>

      {eventinfo?.moreInformation ? (
        <>
          <Heading as="h2">{t('More information')}</Heading>
          {eventinfo.moreInformation ? parse(eventinfo.moreInformation) : null}
        </>
      ) : null}

      {eventinfo?.program ? (
        <>
          <Heading as="h2">{t('Program')}</Heading>
          {eventinfo.program ? parse(eventinfo.program) : null}
        </>
      ) : null}

      {eventinfo?.practicalInformation ? (
        <>
          <Heading as="h2">{t('Practical information')}</Heading>
          {eventinfo.practicalInformation ? parse(eventinfo.practicalInformation) : null}
        </>
      ) : null}
    </>
  );
}

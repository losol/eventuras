'use client';

import { EventDto } from '@losol/eventuras';
import { Heading, Image } from 'components/content';
import { Button } from 'components/inputs';
import { Modal } from 'components/overlays';
import parse from 'html-react-parser';
import { useRouter } from 'next/navigation';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

//TODO figure out if moreInformation can't be part of EventDto from the onset
type EventProps = {
  //event: EventDto & { moreInformation: any };
  event: EventDto;
};

export default function EventPage({ event }: EventProps) {
  const [modal] = useState({ title: '', text: '' });
  const [modalOpen, setModalOpen] = useState(false);

  const { t } = useTranslation();
  const router = useRouter();

  function handleRegister() {
    if (event?.id) router.push(`${event.id}/register`);
  }

  return (
    <>
      <Heading>{event?.title ?? 'Missing Title'}</Heading>

      {event?.featuredImageUrl ? (
        <Image
          src={event.featuredImageUrl}
          alt=""
          width={600}
          height={400}
          caption={event?.featuredImageCaption ?? ''}
        />
      ) : null}

      {event?.description ?? null}

      <div>
        <Button onClick={handleRegister}>Register for event</Button>
      </div>

      {event?.moreInformation ? (
        <>
          <Heading as="h2">{t('More information')}</Heading>
          {event.moreInformation ? parse(event.moreInformation) : null}
        </>
      ) : null}

      {event?.program ? (
        <>
          <Heading as="h2">{t('Program')}</Heading>
          {event.program ? parse(event.program) : null}
        </>
      ) : null}

      {event?.practicalInformation ? (
        <>
          <Heading as="h2">{t('Practical Information')}</Heading>
          {event.practicalInformation ? parse(event.practicalInformation) : null}
        </>
      ) : null}

      <Modal isOpen={modalOpen} onClose={setModalOpen} title={modal.title} text={modal.text} />
    </>
  );
}

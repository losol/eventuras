'use client';

import { EventDto, EventsService } from '@losol/eventuras';
import { useDisclosure } from '@mantine/hooks';
import { Heading, Image } from 'components/content';
import { Button } from 'components/inputs';
import { Modal } from 'components/overlays';
import parse from 'html-react-parser';
import { useRouter } from 'next/router';
//import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';

//type EventProps = EventDto & { moreInformation: any; params: any };
type EventInfoProps = {
  params: {
    id: number;
  };
};

// TODO : get data from server before render
//TODO figure out if moreInformation can't be part of EventDto from the onset
const EventInfo = ({ params }: EventInfoProps) => {
  const [event, setEvent] = useState<EventDto | null>(null);
  const [modal] = useState({ title: '', text: '' });
  const [opened, { close }] = useDisclosure(false);

  //const { t } = useTranslation();
  const router = useRouter();

  function handleRegister() {
    if (event?.id) router.push(`${event.id}/register`);
  }

  // TODO : SWR or change to server component
  useEffect(() => {
    async function getEvents(id: number) {
      const event = await EventsService.getV3Events1({ id }).catch(() => null);
      console.log(event);
      setEvent(event);
    }
    getEvents(params.id);
  }, [params.id]);

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
          {/*<Heading as="h2">{t('More information')}</Heading>*/}
          <Heading as="h2">More information</Heading>
          {event.moreInformation ? parse(event.moreInformation) : null}
        </>
      ) : null}

      {event?.program ? (
        <>
          {/*<Heading as="h2">{t('Program')}</Heading>*/}
          <Heading as="h2">Program</Heading>
          {event.program ? parse(event.program) : null}
        </>
      ) : null}

      {event?.practicalInformation ? (
        <>
          {/*<Heading as="h2">{t('Practical Information')}</Heading>*/}
          <Heading as="h2">Practical Information</Heading>
          {event.practicalInformation ? parse(event.practicalInformation) : null}
        </>
      ) : null}

      <Modal isOpen={opened} onClose={close} title={modal.title} text={modal.text} />
    </>
  );
};

export default EventInfo;

import { Button, Heading, useDisclosure } from '@chakra-ui/react';
import { EventDto, EventsService } from '@losol/eventuras';
import { AlertModal } from 'components';
import parse from 'html-react-parser';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

//TODO figure out if moreInformation can't be part of EventDto from the onset
type EventProps = EventDto & { moreInformation: any };
const EventInfo = (props: EventProps) => {
  const router = useRouter();
  const { title = '...', description = '...' } = props;
  const { t } = useTranslation();
  const [modal] = useState({ title: '', text: '' });
  const { isOpen, onClose } = useDisclosure();

  return (
    <>
      <Heading>{title}</Heading>
      {description}
      <div>
        <Button
          colorScheme="teal"
          variant="outline"
          mt={5}
          onClick={() => router.push(`${props.id}/register`)}
        >
          Register for event
        </Button>
      </div>
      {props.moreInformation && (
        <>
          <Heading as="h2" size="md" paddingTop={16}>
            {t('More information')}
          </Heading>
          {parse(props.moreInformation)}
        </>
      )}
      {props.program && (
        <>
          <Heading as="h2" size="md" paddingTop={16}>
            {t('Program')}
          </Heading>
          {parse(props.program)}
        </>
      )}
      {props.practicalInformation && (
        <>
          <Heading as="h2" size="md" paddingTop={16}>
            {t('Practical Information')}
          </Heading>
          {parse(props.practicalInformation)}
        </>
      )}
      <AlertModal
        isOpen={isOpen}
        onClose={onClose}
        title={modal.title}
        text={modal.text}
      />
    </>
  );
};

export const getStaticProps = async ({ params }: { params: any }) => {
  const event = await EventsService.getV3Events1({ id: params.id }).catch(e => {
    return { props: null };
  });
  return { props: { ...event } };
};

export async function getStaticPaths() {
  const defaultPath = { paths: [], fallback: false };
  const { data: onlineEvents } = await EventsService.getV3Events({}).catch(
    e => {
      return { data: null };
    }
  );
  if (!onlineEvents?.length) {
    return defaultPath;
  }
  const paths = onlineEvents.map(event => ({
    params: {
      id: event.id!.toString(),
    },
  }));

  return { paths, fallback: false };
}

export default EventInfo;

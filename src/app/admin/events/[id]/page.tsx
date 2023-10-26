'use client';

import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

import EventContent from '@/components/event/EventContent';
import EventEmailer from '@/components/event/EventEmailer';
import { Container, Drawer, Layout } from '@/components/ui';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Loading from '@/components/ui/Loading';
import { useEvent, useEventProducts, useRegistrations } from '@/hooks/apiHooks';

import AddUserToEvent from '../../components/AddUserToEvent';
import EventParticipantList from '../../components/EventParticipantList';

type EventInfoProps = {
  params: {
    id: number;
  };
};
/**
 * Initial set up of admin event detail page. WIP.
 * TODO there are a few commonalities with user event detail page and AdminEventList - when this page stops diverging it would be worthwhile
 * to extract common blocks of functionality in different components
 * @returns
 */
const EventDetailPage: React.FC<EventInfoProps> = ({ params }) => {
  const eventId = params.id;
  const [registrationSeed, setRegistrationSeed] = useState(0);
  const { registrations } = useRegistrations(
    {
      eventId,
      includeUserInfo: true,
    },
    registrationSeed
  );
  const { t } = useTranslation('admin');
  const { t: tEvents } = useTranslation('events');
  const { loading: eventsLoading, event } = useEvent(eventId);
  const [emailDrawerOpen, setEmailDrawerOpen] = useState<boolean>(false);
  const { registrationProducts: eventProducts, loading: loadingEventProducts } =
    useEventProducts(eventId);

  if (eventsLoading || loadingEventProducts) {
    return <Loading />;
  }

  return (
    <Layout>
      <Container>
        {eventsLoading && <Loading />}
        {event && (
          <>
            <Heading as="h1">{event.title ?? ''}</Heading>
            <EventContent
              event={event}
              contentField="description"
              heading={tEvents('Description')}
            />
            <AddUserToEvent
              event={event}
              eventProducts={eventProducts}
              onUseradded={() => {
                setRegistrationSeed(registrationSeed + 1);
              }}
            />
            <Button
              variant="primary"
              onClick={() => {
                setEmailDrawerOpen(true);
              }}
            >
              {t('eventEmailer.title')}
            </Button>
            <Drawer isOpen={emailDrawerOpen} onCancel={() => setEmailDrawerOpen(false)}>
              <Drawer.Header as="h3" className="text-black">
                {t('eventEmailer.title')}
              </Drawer.Header>
              <Drawer.Body>
                <EventEmailer
                  eventTitle={event.title!}
                  eventId={event.id!}
                  onClose={() => setEmailDrawerOpen(false)}
                />
              </Drawer.Body>
              <Drawer.Footer>
                <></>
              </Drawer.Footer>
            </Drawer>
          </>
        )}
        {event && registrations ? (
          <EventParticipantList participants={registrations ?? []} event={event!} />
        ) : (
          <Loading />
        )}
      </Container>
    </Layout>
  );
};

export default EventDetailPage;

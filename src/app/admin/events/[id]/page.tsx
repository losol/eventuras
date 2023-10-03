'use client';

import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

import { Heading } from '@/components/content';
import EventEmailer from '@/components/event/EventEmailer';
import { Loading } from '@/components/feedback';
import Button from '@/components/inputs/Button';
import { Container, Drawer, Layout } from '@/components/layout';
import { useEvent, useRegistrations } from '@/hooks/apiHooks';

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
  const { registrations } = useRegistrations({
    eventId,
    includeUserInfo: true,
  });
  const { t } = useTranslation('admin');
  const { loading: eventsLoading, event } = useEvent(eventId);
  const [emailDrawerOpen, setEmailDrawerOpen] = useState<boolean>(false);

  if (eventsLoading) {
    return <Loading />;
  }

  return (
    <Layout>
      <Container>
        {eventsLoading && <Loading />}
        {event && (
          <>
            <Heading as="h1">{event.title ?? ''}</Heading>
            <p>{event.description ?? ''}</p>

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

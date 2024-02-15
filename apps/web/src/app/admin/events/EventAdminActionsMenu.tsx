'use client';

import { EventDto, ProductDto } from '@eventuras/sdk';
import createTranslation from 'next-translate/createTranslation';
import { useState } from 'react';

import EventNotificator, { EventNotificatorType } from '@/components/event/EventNotificator';
import { Drawer } from '@/components/ui';
import Button from '@/components/ui/Button';
import ButtonGroup from '@/components/ui/ButtonGroup';
import Link from '@/components/ui/Link';

import AddUserToEvent from './AddUserToEvent';

export interface EventAdminActionsMenuProps {
  eventinfo: EventDto;
  eventProducts?: ProductDto[];
}

const EventAdminActionsMenu: React.FC<EventAdminActionsMenuProps> = ({
  eventinfo,
  eventProducts = [],
}) => {
  const [emailDrawerOpen, setEmailDrawerOpen] = useState<boolean>(false);
  const [SMSDrawerOpen, setSMSDrawerOpen] = useState<boolean>(false);
  const { t } = createTranslation();

  return (
    <>
      <ButtonGroup>
        <Link href={`/admin/events/${eventinfo.id}/edit`} variant="button-outline">
          {t('common:labels.edit')}
        </Link>
        <Link href={`/admin/events/${eventinfo.id}/products`} variant="button-outline">
          {t('common:labels.products')}
        </Link>
        <Button
          variant="outline"
          onClick={() => {
            setEmailDrawerOpen(true);
          }}
        >
          {t('admin:eventEmailer.title')}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setSMSDrawerOpen(true);
          }}
        >
          SMS
        </Button>
      </ButtonGroup>
      <AddUserToEvent eventinfo={eventinfo} eventProducts={eventProducts ?? []} />

      <Drawer isOpen={emailDrawerOpen} onCancel={() => setEmailDrawerOpen(false)}>
        <Drawer.Header as="h3" className="text-black">
          {t('admin:eventEmailer.title')}
        </Drawer.Header>
        <Drawer.Body>
          <EventNotificator
            eventTitle={eventinfo.title!}
            eventId={eventinfo.id!}
            onClose={() => setEmailDrawerOpen(false)}
            notificatorType={EventNotificatorType.EMAIL}
          />
        </Drawer.Body>
        <Drawer.Footer>
          <></>
        </Drawer.Footer>
      </Drawer>
      <Drawer isOpen={SMSDrawerOpen} onCancel={() => setSMSDrawerOpen(false)}>
        <Drawer.Header as="h3" className="text-black">
          SMS
        </Drawer.Header>
        <Drawer.Body>
          <EventNotificator
            eventTitle={eventinfo.title!}
            eventId={eventinfo.id!}
            onClose={() => setSMSDrawerOpen(false)}
            notificatorType={EventNotificatorType.SMS}
          />
        </Drawer.Body>
        <Drawer.Footer>
          <></>
        </Drawer.Footer>
      </Drawer>
    </>
  );
};

export default EventAdminActionsMenu;

'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button, ButtonGroup } from '@eventuras/ratio-ui/core/Button';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';
import { Link } from '@eventuras/ratio-ui-next/Link';

import EventNotificator, { EventNotificatorType } from '@/components/event/EventNotificator';
import { EventDto, ProductDto } from "@/lib/eventuras-sdk";

import { ExcelExportButton } from './[id]/ExcelExportButton';
import AddUserToEvent from './AddUserToEvent';
import { AdminCertificatesActionsMenu } from './AdminCertificatesActionsMenu';
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
  const t = useTranslations();
  return (
    <>
      <ButtonGroup>
        <Link href={`/admin/events/${eventinfo.id}/edit`} variant="button-outline">
          {t('common.labels.edit')}
        </Link>
        <Link href={`/admin/events/${eventinfo.id}/products`} variant="button-outline">
          {t('common.labels.products')}
        </Link>
        <AdminCertificatesActionsMenu eventinfo={eventinfo} />
        <Button
          variant="outline"
          onClick={() => {
            setEmailDrawerOpen(true);
          }}
        >
          {t('admin.eventNotifier.title')}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setSMSDrawerOpen(true);
          }}
        >
          SMS
        </Button>
        <Link href={`/admin/notifications?eventId=${eventinfo.id}`} variant="button-outline">
          {t('common.labels.messagelog')}
        </Link>
        <ExcelExportButton EventinfoId={eventinfo.id!} />
      </ButtonGroup>
      <AddUserToEvent eventinfo={eventinfo} eventProducts={eventProducts ?? []} />
      <Drawer isOpen={emailDrawerOpen} onCancel={() => setEmailDrawerOpen(false)}>
        <Drawer.Header as="h3" className="text-black">
          {t('admin.eventNotifier.title')}
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

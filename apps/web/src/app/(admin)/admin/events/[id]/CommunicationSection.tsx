'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@eventuras/ratio-ui/core/Button';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';

import { EventNotificator, NotificationType } from '@/components/notificator';
import { EventDto, NotificationDto } from '@/lib/eventuras-sdk';

import NotificationsTable from './NotificationsTable';

type CommunicationSectionProps = {
  eventinfo: EventDto;
  notifications: NotificationDto[];
};

export default function CommunicationSection({
  eventinfo,
  notifications,
}: CommunicationSectionProps) {
  const [emailDrawerOpen, setEmailDrawerOpen] = useState<boolean>(false);
  const [SMSDrawerOpen, setSMSDrawerOpen] = useState<boolean>(false);
  const t = useTranslations();

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold">Send Notifications</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                setEmailDrawerOpen(true);
              }}
            >
              {t('admin.eventNotifier.title')}
            </Button>
            <Button
              onClick={() => {
                setSMSDrawerOpen(true);
              }}
            >
              SMS
            </Button>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">Notification History</h3>
          <NotificationsTable notifications={notifications} />
        </div>
      </div>

      <Drawer isOpen={emailDrawerOpen} onCancel={() => setEmailDrawerOpen(false)}>
        <Drawer.Header as="h3" className="text-black">
          {t('admin.eventNotifier.title')}
        </Drawer.Header>
        <Drawer.Body>
          <EventNotificator
            eventTitle={eventinfo.title!}
            eventId={eventinfo.id!}
            onClose={() => setEmailDrawerOpen(false)}
            notificationType={NotificationType.EMAIL}
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
            notificationType={NotificationType.SMS}
          />
        </Drawer.Body>
        <Drawer.Footer>
          <></>
        </Drawer.Footer>
      </Drawer>
    </>
  );
}

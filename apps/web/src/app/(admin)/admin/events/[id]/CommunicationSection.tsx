'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@eventuras/ratio-ui/core/Button';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { EventNotificator, NotificationType } from '@/components/notificator';
import { EventDto } from '@/lib/eventuras-sdk';

type CommunicationSectionProps = {
  eventinfo: EventDto;
};

export default function CommunicationSection({ eventinfo }: CommunicationSectionProps) {
  const [emailDrawerOpen, setEmailDrawerOpen] = useState<boolean>(false);
  const [SMSDrawerOpen, setSMSDrawerOpen] = useState<boolean>(false);
  const t = useTranslations();

  return (
    <>
      <div className="space-y-4">
        <div>
          <h3 className="mb-4 text-lg font-semibold">Send Notifications</h3>
          <div className="flex flex-wrap gap-3">
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
          </div>
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

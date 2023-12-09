// EventDetails.tsx
'use client';

import { EventDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';
import React from 'react';

import { Container } from '@/components/ui';
import MarkdownContent from '@/components/ui/MarkdownContent';
import Tabs from '@/components/ui/Tabs';

type EventProps = {
  eventinfo: EventDto;
  bgClassNames?: string;
};

const EventDetails: React.FC<EventProps> = ({ eventinfo }) => {
  const { t } = createTranslation();

  if (!eventinfo) return <div>{t('common:events.event-not-found')}</div>;

  const tabs = [
    {
      name: t('common:events.moreinformation'),
      content: eventinfo.moreInformation,
    },
    {
      name: t('common:events.program'),
      content: eventinfo.program,
    },
    {
      name: t('common:events.practicalinformation'),
      content: eventinfo.practicalInformation,
    },
  ].filter(tab => tab.content);

  return (
    <section
      id="eventdetails"
      className="eventdetails bg-primary-100/30 dark:bg-primary-900 py-10 min-h-[60vh]"
    >
      <Container>
        <Tabs>
          {tabs.map((tab, index) => (
            <Tabs.Item key={index} title={tab.name}>
              <MarkdownContent markdown={tab.content} />
            </Tabs.Item>
          ))}
        </Tabs>
      </Container>
    </section>
  );
};

export default EventDetails;

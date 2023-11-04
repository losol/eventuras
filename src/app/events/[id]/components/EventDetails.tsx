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

export default function EventDetails({ eventinfo }: EventProps) {
  const { t } = createTranslation();

  if (!eventinfo) return <div>{t('common:events.event-not-found')}</div>;

  const tabs = [
    {
      name: 'Description',
      content: eventinfo.description,
      heading: t('common:events.description'),
    },
    {
      name: 'More Information',
      content: eventinfo.moreInformation,
      heading: t('common:events.moreinformation'),
    },
    {
      name: 'Program',
      content: eventinfo.program,
      heading: t('common:events.program'),
    },
    {
      name: 'Practical Information',
      content: eventinfo.practicalInformation,
      heading: t('common:events.practicalinformation'),
    },
  ].filter(tab => tab.content);

  return (
    <section id="eventdetails" className="bg-primary-100/30 dark:bg-primary-900 py-10 min-h-[60vh]">
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
}

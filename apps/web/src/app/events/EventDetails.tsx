// EventDetails.tsx
'use client';

import { MarkdownContent } from '@eventuras/markdown';
import { EventDto } from '@eventuras/sdk';
import { Heading } from '@eventuras/ui';
import createTranslation from 'next-translate/createTranslation';
import React from 'react';

import Link from '@/components/Link';

type EventProps = {
  eventinfo: EventDto;
  bgClassNames?: string;
};

const EventDetails: React.FC<EventProps> = ({ eventinfo }) => {
  const { t } = createTranslation();

  if (!eventinfo) return <div>{t('common:events.event-not-found')}</div>;

  const sections = [
    {
      id: 'more-information',
      title: t('common:events.moreinformation'),
      content: eventinfo.moreInformation,
    },
    {
      id: 'program',
      title: t('common:events.program'),
      content: eventinfo.program,
    },
    {
      id: 'practical-information',
      title: t('common:events.practicalinformation'),
      content: eventinfo.practicalInformation,
    },
  ].filter(section => section.content);

  return (
    <section
      id="eventdetails"
      className="eventdetails bg-primary-100/30 dark:bg-primary-900 py-10 min-h-screen"
    >
      <div className="flex flex-col md:flex-row container mx-auto">
        <div className="mb-8 md:mb-0 md:sticky md:top-20 md:flex md:flex-col md:mr-8 md:w-1/4 mt-10">
          {sections.map((section, index) => (
            <Link key={index} href={`#${section.id}`} variant="button-transparent">
              {section.title}
            </Link>
          ))}
        </div>

        <div className="flex-grow md:w-3/4">
          {sections.map((section, index) => (
            <section key={index} id={section.id} className="mb-8">
              <Heading as="h2">{section.title}</Heading>
              <MarkdownContent markdown={section.content} />
            </section>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventDetails;

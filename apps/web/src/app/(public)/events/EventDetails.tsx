import React from 'react';
import { useTranslations } from 'next-intl';

import { MarkdownContent } from '@eventuras/markdown';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { NavList } from '@eventuras/ratio-ui/core/NavList';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { EventDto } from '@/lib/eventuras-public-sdk';
type EventProps = {
  eventinfo: EventDto;
  bgClassNames?: string;
};
/**
 * Renders event details with top sticky navigation for sections.
 * @param props - See {@link EventProps}.
 */
const EventDetails: React.FC<EventProps> = ({ eventinfo }) => {
  const t = useTranslations();
  if (!eventinfo) return <div>{t('common.events.event-not-found')}</div>;
  const sections = [
    {
      id: 'information',
      href: '#more-information',
      title: t('common.events.moreinformation'),
      content: eventinfo.moreInformation,
    },
    {
      id: 'program',
      href: '#program',
      title: t('common.events.program'),
      content: eventinfo.program,
    },
    {
      id: 'practical-information',
      href: '#practical-information',
      title: t('common.events.practicalinformation'),
      content: eventinfo.practicalInformation,
    },
  ];
  return (
    <Section className="pb-24">
      <NavList items={sections} LinkComponent={Link} sticky />
      {sections.map(section => (
        <Section key={section.id} id={section.id} container>
          <Heading as="h2">{section.title}</Heading>
          <MarkdownContent markdown={section.content!} allowExternalLinks={true} />
        </Section>
      ))}
    </Section>
  );
};
export default EventDetails;

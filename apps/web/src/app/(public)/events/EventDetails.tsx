import React from 'react';
import { useTranslations } from 'next-intl';

import {
  calloutComponents,
  calloutSanitizeSchema,
  MarkdownContent,
  mergeSanitizeSchemas,
  remarkCallout,
} from '@eventuras/markdown';
import {
  remarkSchedule,
  scheduleComponents,
  scheduleSanitizeSchema,
} from '@eventuras/markdown-plugin-happening';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { NavList } from '@eventuras/ratio-ui/core/NavList';
import { AsideLayout } from '@eventuras/ratio-ui/layout/AsideLayout';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { EventDto } from '@/lib/eventuras-public-sdk';

type EventProps = {
  eventinfo: EventDto;
  /** Rendered in a sticky right-hand column on wide screens, e.g. the registration card. */
  aside?: React.ReactNode;
};

/**
 * Renders event details with top sticky navigation for sections.
 * @param props - See {@link EventProps}.
 */
const EventDetails: React.FC<EventProps> = ({ eventinfo, aside }) => {
  const t = useTranslations();
  if (!eventinfo) return <div>{t('common.events.event-not-found')}</div>;
  const sections = [
    {
      id: 'more-information',
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
  ].filter(section => section.content);

  if (sections.length === 0 && !aside) return null;

  return (
    <Section className="pb-24">
      {sections.length > 0 && <NavList items={sections} LinkComponent={Link} sticky />}
      <Container size="xl">
        <AsideLayout className="pt-8">
          <AsideLayout.Main>
            {sections.map(section => (
              <section key={section.id} id={section.id} className="mb-10">
                <Heading as="h2" size="md">
                  {section.title}
                </Heading>
                <div className="mt-4">
                  <MarkdownContent
                    markdown={section.content}
                    allowExternalLinks={true}
                    remarkPlugins={[remarkSchedule, remarkCallout]}
                    customComponents={{ ...scheduleComponents, ...calloutComponents }}
                    sanitizeSchemaExtension={mergeSanitizeSchemas(
                      scheduleSanitizeSchema,
                      calloutSanitizeSchema
                    )}
                  />
                </div>
              </section>
            ))}
          </AsideLayout.Main>
          {aside && (
            <AsideLayout.Aside width="lg" top={64}>
              {aside}
            </AsideLayout.Aside>
          )}
        </AsideLayout>
      </Container>
    </Section>
  );
};
export default EventDetails;

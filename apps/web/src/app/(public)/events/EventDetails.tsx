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
import { AsideLayout } from '@eventuras/ratio-ui/layout/AsideLayout';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import EventSectionNav from '@/app/(public)/events/EventSectionNav';
import { EventDto } from '@/lib/eventuras-public-sdk';

// Sticky stack in ratio-ui spacing units (0.25rem on a fluid root font size):
// the site navbar (`h-16`), the section nav under it (`h-12`), then a gap.
const SITE_NAV_UNITS = 16;
const SECTION_NAV_UNITS = 12;
const GAP_UNITS = 6;
const units = (n: number) => `calc(var(--spacing) * ${n})`;

type EventProps = {
  eventinfo: EventDto;
  /** Rendered in a sticky right-hand column on wide screens, e.g. the registration card. */
  aside?: React.ReactNode;
};

/**
 * Renders event details with a sticky section nav under the site navbar.
 * @param props - See {@link EventProps}.
 */
const EventDetails: React.FC<EventProps> = ({ eventinfo, aside }) => {
  const t = useTranslations();
  if (!eventinfo) return <div>{t('common.events.event-not-found')}</div>;
  const sections = [
    {
      id: 'more-information',
      title: t('common.events.moreinformation'),
      content: eventinfo.moreInformation,
    },
    {
      id: 'program',
      title: t('common.events.program'),
      content: eventinfo.program,
    },
    {
      id: 'practical-information',
      title: t('common.events.practicalinformation'),
      content: eventinfo.practicalInformation,
    },
  ].filter(section => section.content);

  if (sections.length === 0 && !aside) return null;

  const registrationLabel = t('common.events.detailspage.registration');
  const hasNav = sections.length > 0;
  const navItems = [
    ...sections.map(({ id, title }) => ({ id, title })),
    ...(aside ? [{ id: 'registration', title: registrationLabel }] : []),
  ];
  const stickyUnits = SITE_NAV_UNITS + (hasNav ? SECTION_NAV_UNITS : 0) + GAP_UNITS;
  const stickyTop = units(stickyUnits);

  return (
    <Section className="pb-24">
      {hasNav && (
        <EventSectionNav
          sections={navItems}
          top={units(SITE_NAV_UNITS)}
          ariaLabel={t('common.events.detailspage.sectionNav')}
        />
      )}
      <Container size="xl">
        <AsideLayout className="pt-10">
          <AsideLayout.Main>
            {sections.map(section => (
              <section
                key={section.id}
                id={section.id}
                className="mb-10"
                style={{ scrollMarginTop: stickyTop }}
              >
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
            // AsideLayout.Aside only takes a px `top`; the sticky stack is rem-based, so
            // mirror its classes here until ratio-ui accepts a CSS length.
            <aside
              id="registration"
              aria-label={registrationLabel}
              className="mt-8 lg:mt-0 lg:shrink-0 lg:sticky lg:w-96"
              style={{ top: stickyTop, scrollMarginTop: stickyTop }}
            >
              {aside}
            </aside>
          )}
        </AsideLayout>
      </Container>
    </Section>
  );
};
export default EventDetails;

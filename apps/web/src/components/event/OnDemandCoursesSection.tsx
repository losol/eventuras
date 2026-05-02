import { getTranslations } from 'next-intl/server';

import { Card } from '@eventuras/ratio-ui/core/Card';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Grid } from '@eventuras/ratio-ui/layout/Grid';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { EventDto } from '@/lib/eventuras-sdk';

interface OnDemandCoursesSectionProps {
  events: EventDto[];
}

/**
 * Frontpage section for on-demand courses ("Nettkurs") — events where
 * `type === 'Course'` and `onDemand === true`. Renders as a tinted Card
 * matching the featured-collection block, with a grid of compact course
 * cards.
 *
 * Cards show only what `EventDto` exposes today: a "Nettkurs" eyebrow,
 * serif title, and optional headline. Icon, kurspoeng, and duration meta
 * (visible in the design reference) are deferred until the SDK has those
 * fields.
 */
export const OnDemandCoursesSection = async ({ events }: OnDemandCoursesSectionProps) => {
  if (events.length === 0) return null;

  const t = await getTranslations();

  return (
    <Section paddingY="lg" id="ondemand">
      <Container>
        <Card color="primary" padding="sm" radius="xl" shadow="none">
          <Section.Header>
            <Section.Eyebrow>{t('common.events.onDemand.eyebrow')}</Section.Eyebrow>
            <Section.Title>{t('common.events.onDemand.title')}</Section.Title>
          </Section.Header>
          <Grid cols={{ sm: 2, md: 2, lg: 3 }}>
            {events.map(event => (
              <Card
                key={event.id}
                padding="md"
                radius="lg"
                border
                hoverEffect
                className="flex flex-col gap-2 h-full bg-card"
              >
                <span className="font-mono text-xs uppercase tracking-wider text-(--primary) font-semibold self-end">
                  {t('common.events.onDemand.tag')}
                </span>
                <Link
                  href={`/events/${event.id}/${event.slug ?? ''}`}
                  linkOverlay
                  className="font-serif text-lg leading-tight text-(--text) no-underline hover:text-(--primary)"
                >
                  {event.title}
                </Link>
                {event.headline && (
                  <span className="text-sm text-(--text-muted) line-clamp-3">{event.headline}</span>
                )}
              </Card>
            ))}
          </Grid>
        </Card>
      </Container>
    </Section>
  );
};

export default OnDemandCoursesSection;

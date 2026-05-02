import { formatCompactDateRange } from '@eventuras/core/datetime';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Strip } from '@eventuras/ratio-ui/core/Strip';
import { MapPin } from '@eventuras/ratio-ui/icons';
import { Link } from '@eventuras/ratio-ui-next/Link';

import type { EventDto } from '@/lib/eventuras-types';

interface EventListRowProps {
  event: EventDto;
  ctaLabel: string;
  locale: string;
}

/**
 * Three-column event row for chronological listings — date column
 * (mono uppercase range + year), body column (category badge + serif
 * title + optional headline), and meta column (location + CTA). The
 * whole row links to the event detail page via `Strip`'s built-in
 * anchor behaviour; hover lifts the surface and tints the border.
 *
 * Pairs with `EventTile` (compact tiles for collection grids) and
 * `EventCard` (the standalone larger card). Use this row in flat
 * listings where chronology and dense scan-ability matter.
 *
 * Differs from the design reference for now: collection pill, status
 * pill ("FULLT"), kurspoeng row — those need SDK fields we don't have
 * yet. Easy to layer in once available.
 */
export const EventListRow: React.FC<EventListRowProps> = ({ event, ctaLabel, locale }) => {
  const startDate = event.dateStart ? new Date(event.dateStart as string) : null;
  const yearLabel = startDate
    ? new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(startDate)
    : '';
  const rangeLabel = formatCompactDateRange(
    event.dateStart as string | null | undefined,
    event.dateEnd as string | null | undefined,
    locale
  );
  const placeLabel = [event.location, event.city].filter(Boolean).join(', ');

  return (
    <Strip hoverEffect as={Link} href={`/events/${event.id}/${event.slug ?? ''}`}>
      <Strip.Lead>
        {rangeLabel && <span>{rangeLabel}</span>}
        {yearLabel && <span>{yearLabel}</span>}
      </Strip.Lead>
      <Strip.Body>
        {event.category && (
          <Badge variant="subtle" className="self-start">
            {event.category}
          </Badge>
        )}
        <h3 className="font-serif text-xl leading-tight tracking-tight text-(--primary) m-0">
          {event.title}
        </h3>
        {event.headline && (
          <p className="text-sm text-(--text-muted) m-0 max-w-prose line-clamp-2">
            {event.headline}
          </p>
        )}
      </Strip.Body>
      <Strip.Trail>
        {placeLabel && (
          <span className="inline-flex items-center gap-2 text-sm">
            <MapPin className="size-4 shrink-0 text-(--text-subtle)" aria-hidden="true" />
            <span className="font-semibold text-(--text)">{placeLabel}</span>
          </span>
        )}
        <span className="md:mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-(--primary) transition-transform group-hover/strip:translate-x-0.5">
          {ctaLabel} <span aria-hidden="true">→</span>
        </span>
      </Strip.Trail>
    </Strip>
  );
};

export default EventListRow;

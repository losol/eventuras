import { formatCompactDateRange } from '@eventuras/core/datetime';
import { MarkdownContent } from '@eventuras/markdown';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Strip } from '@eventuras/ratio-ui/core/Strip';
import { MapPin } from '@eventuras/ratio-ui/icons';
import { Link } from '@eventuras/ratio-ui-next/Link';

import type { EventDto } from '@/lib/eventuras-types';

interface EventListRowProps {
  event: EventDto;
  ctaLabel: string;
  locale: string;
  /**
   * Optional collection name. When provided the strip body shows a
   * subtle `Badge` with the collection name so an event listed outside
   * its collection's surface (e.g. in a chronological all-courses
   * list) carries that context. Pass undefined for events that stand
   * on their own or are already rendered inside their collection's
   * surface.
   */
  collectionName?: string;
}

/**
 * Three-column event row for chronological listings — date column
 * (mono uppercase range + year), body column (category badge + serif
 * title + optional description excerpt), and meta column (location +
 * CTA). The whole row links to the event detail page via `Strip`'s
 * built-in anchor behaviour; hover lifts the surface and tints the
 * border.
 *
 * Pairs with `EventTile` (compact tiles for collection grids) and
 * `EventCard` (the standalone larger card). Use this row in flat
 * listings where chronology and dense scan-ability matter.
 *

 */
export const EventListRow: React.FC<EventListRowProps> = ({
  event,
  ctaLabel,
  locale,
  collectionName,
}) => {
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
        <div className="flex flex-wrap gap-1.5">
          {event.category && <Badge variant="subtle">{event.category}</Badge>}
          {collectionName && <Badge variant="subtle">{collectionName}</Badge>}
        </div>
        <Heading.Group>
          <Heading
            as="h3"
            className="font-serif text-xl leading-tight tracking-tight text-(--primary) m-0"
          >
            {event.title}
          </Heading>
          {event.headline && (
            <p className="text-sm text-(--text) m-0 max-w-prose line-clamp-2">{event.headline}</p>
          )}
        </Heading.Group>
        {event.description && (
          <div className="text-sm text-(--text-muted) max-w-prose line-clamp-2 [&_p]:m-0 [&_p]:text-inherit">
            <MarkdownContent markdown={event.description} />
          </div>
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

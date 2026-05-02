import { formatCompactDateRange } from '@eventuras/core/datetime';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { appConfig } from '@/config.server';
import { EventDto } from '@/lib/eventuras-sdk';

interface EventTileProps {
  event: EventDto;
}

/**
 * Compact event tile for collection grids and dense listings — date pill,
 * serif title, optional headline, and place. Pairs with `EventCard` (the
 * heavier card used standalone). The whole tile is a link via
 * `linkOverlay` on the title; hover lifts the surface + primary border
 * via `Card`'s `hoverEffect`.
 *
 * Category indicator (the small dot in the design reference) is
 * intentionally omitted until we have a category-name → token-color
 * mapping. Re-introduce when that lands.
 */
export const EventTile: React.FC<EventTileProps> = ({ event }) => {
  const dateLabel = formatCompactDateRange(
    event.dateStart as string | null | undefined,
    event.dateEnd as string | null | undefined,
    appConfig.env.DEFAULT_LOCALE as string
  );
  const placeLabel = [event.location, event.city].filter(Boolean).join(', ');

  return (
    <Card padding="sm" radius="lg" border hoverEffect className="flex flex-col gap-2 h-full">
      {dateLabel && (
        <span className="font-mono text-xs uppercase tracking-wider text-(--text-subtle) font-semibold">
          {dateLabel}
        </span>
      )}
      <Link
        href={`/events/${event.id}/${event.slug ?? ''}`}
        linkOverlay
        className="font-serif text-base leading-tight text-(--text) no-underline hover:text-(--primary)"
      >
        {event.title}
      </Link>
      {event.headline && (
        <span className="text-sm text-(--text-muted) line-clamp-2">{event.headline}</span>
      )}
      {placeLabel && <span className="text-xs text-(--text-muted) mt-auto">{placeLabel}</span>}
    </Card>
  );
};

export default EventTile;

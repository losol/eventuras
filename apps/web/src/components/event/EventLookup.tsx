'use client';

import { Lookup } from '@eventuras/ratio-ui/core/Lookup';

import { fetchEventsForLookup } from '@/app/(admin)/admin/actions/events';
import { EventDto } from '@/lib/eventuras-sdk';

let cachedEvents: EventDto[] | null = null;

export type EventLookupConstraints = {
  start?: string;
};

export type EventLookupProps = {
  id?: string;
  eventLookupConstraints?: EventLookupConstraints;
  onEventSelected?: (event: EventDto) => Promise<void> | void;
};

async function loadEvents(query: string): Promise<EventDto[]> {
  if (!cachedEvents) {
    const result = await fetchEventsForLookup();
    if (!result.success || !result.data) return [];
    cachedEvents = result.data;
  }
  const normalizedQuery = query.toLocaleLowerCase();
  return cachedEvents.filter(evt =>
    (evt.title ?? '').toLocaleLowerCase().includes(normalizedQuery)
  );
}

const EventLookup = (props: EventLookupProps) => (
  <Lookup<EventDto>
    label="Event"
    placeholder="Event name"
    minChars={1}
    inputId={props.id}
    load={loadEvents}
    getItemKey={e => e.id!}
    getItemLabel={e => e.title ?? ''}
    renderItem={e => (
      <div>
        <span className="block truncate font-bold">
          {e.title} {e.headline ?? ''}
        </span>
        <p className="text-sm text-gray-600">Location: {e.location}</p>
        <p className="text-sm text-gray-600">
          Dates: {e.dateStart?.toString() ?? ''}
          {e.dateEnd && ' => '} {e.dateEnd?.toString() ?? ''}
        </p>
      </div>
    )}
    onItemSelected={e => props.onEventSelected?.(e)}
    emptyState="No events found"
  />
);

export default EventLookup;

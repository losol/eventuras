'use client';
import { Input, Label, Popover } from 'react-aria-components';
import { useAsyncList } from 'react-stately';

import {
  AutoComplete,
  ListBox,
  ListBoxItem,
  SearchField,
} from '@eventuras/ratio-ui/forms/Autocomplete';

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

const EventLookup = (props: EventLookupProps) => {
  const list = useAsyncList<EventDto>({
    async load({ signal, filterText }) {
      const tester = new RegExp(`${filterText ?? ''}`, 'gi');
      let data: EventDto[] = [];

      if (!cachedEvents) {
        const result = await fetchEventsForLookup();
        if (!result.success || !result.data) {
          return { items: [] };
        }
        data = result.data;
        cachedEvents = data;
      } else {
        data = cachedEvents;
      }

      const filtered = data.filter((evt: EventDto) => {
        return tester.test(evt.title ?? '');
      });

      return { items: filtered };
    },
  });

  const handleSelectionChange = (keys: any) => {
    const eventId = Array.from(keys)[0] as number;
    const event = list.items.find(e => e.id === eventId);
    if (event && props.onEventSelected) {
      props.onEventSelected(event);
    }
  };

  return (
    <AutoComplete
      inputValue={list.filterText}
      onInputChange={list.setFilterText}
      isLoading={list.isLoading}
    >
      <SearchField className="flex flex-col gap-1">
        <Label className="text-sm font-medium">Event</Label>
        <Input
          id={props.id}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Event name"
        />
      </SearchField>
      <Popover className="w-[--trigger-width] mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out">
        <ListBox
          items={list.items}
          className="outline-none"
          selectionMode="single"
          onSelectionChange={handleSelectionChange}
          renderEmptyState={() => (
            <div className="px-3 py-2 text-sm text-gray-500">No events found</div>
          )}
        >
          {item => {
            const event = item as EventDto;
            return (
              <ListBoxItem
                textValue={event.title ?? ''}
                className="px-3 py-2 cursor-pointer outline-none hover:bg-blue-50 focus:bg-blue-100"
              >
                <div>
                  <span className="block truncate font-bold">
                    {event.title} {event.headline ?? ''}
                  </span>
                  <p className="text-sm text-gray-600">Location: {event.location}</p>
                  <p className="text-sm text-gray-600">
                    Dates: {event.dateStart?.toString() ?? ''}
                    {event.dateEnd !== null ? ' => ' : ''} {event.dateEnd?.toString() ?? ''}
                  </p>
                </div>
              </ListBoxItem>
            );
          }}
        </ListBox>
      </Popover>
    </AutoComplete>
  );
};
export default EventLookup;

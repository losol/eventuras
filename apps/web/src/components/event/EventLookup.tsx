'use client';
import { useCallback } from 'react';

import { EventDto } from '@eventuras/event-sdk';
import type { AutoCompleteItem } from '@eventuras/ratio-ui/forms/InputAutocomplete';
import { InputAutoComplete } from '@eventuras/ratio-ui/forms/InputAutocomplete';

import { fetchEventsForLookup } from '@/app/(admin)/admin/actions/events';
let cachedEvents: EventDto[] | null = null;
const comboRender = (item: AutoCompleteItem, selected?: boolean) => {
  const evt: EventDto = item.original as EventDto;
  if (evt) {
    return (
      <div>
        <span className={`block truncate ${selected ? 'font-black' : 'font-bold'}`}>
          {item.label} {evt.headline ?? ''}
        </span>
        <p>Location:{evt.location}</p>
        <p>
          Dates:{evt.dateStart?.toString() ?? ''}
          {evt.dateEnd !== null ? '=>' : ''} {evt.dateEnd?.toString() ?? ''}
        </p>
      </div>
    );
  }
  return <></>;
};
export type EventLookupConstraints = {
  start?: string;
};
export type EventLookupProps = {
  id?: string;
  eventLookupConstraints?: EventLookupConstraints;
  onEventSelected?: (event: EventDto) => Promise<void> | void;
};
const EventLookup = (props: EventLookupProps) => {
  const dataProvider = useCallback(async (input: string) => {
    const tester = new RegExp(`${input}`, 'gi');
    let data: EventDto[] = [];
    if (!cachedEvents) {
      const result = await fetchEventsForLookup();
      if (!result.success || !result.data) {
        return {
          ok: false,
          error: new Error(result.success ? 'No data' : result.error.message),
          value: [],
        };
      }
      data = result.data;
      cachedEvents = data;
    } else {
      data = cachedEvents;
    }
    return {
      ok: true,
      error: null,
      value: data
        .filter((evt: EventDto) => {
          return tester.test(evt.title ?? '');
        })
        .map((evt: EventDto) => {
          return {
            id: evt.id!,
            label: evt.title!,
            original: evt,
          };
        }),
    };
  }, []);
  return (
    <InputAutoComplete
      id={props.id}
      minimumAmountOfCharacters={0}
      dataProvider={dataProvider}
      placeholder="Event name"
      itemRenderer={comboRender}
      onItemSelected={props.onEventSelected}
    />
  );
};
export default EventLookup;

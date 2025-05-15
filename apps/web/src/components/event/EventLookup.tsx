import { EventDto, LocalDate } from '@eventuras/sdk';
import { AutoCompleteItem, InputAutoComplete } from '@eventuras/ratio-ui';
import { useCallback } from 'react';

import { createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
const ORGANIZATION_ID: number = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID);
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
  start: LocalDate;
};
export type EventLookupProps = {
  id?: string;
  eventLookupConstraints?: EventLookupConstraints;
  onEventSelected?: (event: EventDto) => Promise<any> | void;
};

const EventLookup = (props: EventLookupProps) => {
  const dataProvider = useCallback(async (input: string) => {
    const tester = new RegExp(`${input}`, 'gi');
    let data = null;
    if (!cachedEvents) {
      const result = await createSDK({ inferUrl: true }).events.getV3Events({
        organizationId: ORGANIZATION_ID,
        ...props.eventLookupConstraints,
      });
      data = result.data ?? [];
      cachedEvents = data;
    } else {
      data = cachedEvents;
    }
    return {
      ok: true,
      error: null,
      value: data
        .filter((evt: EventDto) => {
          return tester.test(evt.title!);
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

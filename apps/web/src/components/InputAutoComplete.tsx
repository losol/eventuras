'use client';
import { Combobox, Transition } from '@headlessui/react';
import { IconArrowDown } from '@tabler/icons-react';
import { FocusEventHandler, Fragment, ReactElement, useCallback, useRef, useState } from 'react';

import Loading from '../../../../libs/ui/src/Loading';

export type AutoCompleteItem = {
  id: any;
  label: string;
  original: any;
};

export type AutoCompleteDataProviderResult = {
  ok: boolean;
  value: AutoCompleteItem[] | null;
  error: Error | null;
};

export type AutoCompleteDataProvider = (input: string) => Promise<AutoCompleteDataProviderResult>;

export type InputAutoCompleteProps = {
  id?: string;
  placeholder?: string;
  dataProvider: AutoCompleteDataProvider;
  minimumAmountOfCharacters: number;
  comboOptionRender?: (item: AutoCompleteItem, selected: boolean, active: boolean) => ReactElement;
  onItemSelected?: (u: { id: any }) => Promise<any> | void;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  ready?: boolean;
};

const comboOption = (dataItem: AutoCompleteItem, props: InputAutoCompleteProps) => (
  <Combobox.Option
    key={dataItem.id}
    className={({ active }) =>
      `relative cursor-default select-none py-2 pl-5 pr-4 ${
        active ? 'bg-blue-600 text-white' : 'text-gray-900'
      }`
    }
    value={dataItem}
  >
    {({ selected, active }) => (
      <>
        {!props.comboOptionRender && (
          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
            {dataItem.label}
          </span>
        )}
        {props.comboOptionRender && props.comboOptionRender(dataItem, selected, active)}
        {selected ? (
          <span
            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
              active ? 'text-white' : 'text-teal-600'
            }`}
          >
            <div className="h-5 w-5" aria-hidden="true" />
          </span>
        ) : null}
      </>
    )}
  </Combobox.Option>
);

const InputAutoComplete = (props: InputAutoCompleteProps) => {
  const [selected, setSelected] = useState<any | null>(null);
  const intervalId = useRef(-1);
  const [response, setResponse] = useState<any[] | null>(null);
  const localCache = useRef<Map<string, any[]>>(new Map());
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChanged = useCallback((searchString: string) => {
    const cacheHit = localCache.current.get(searchString);

    if (cacheHit) {
      setResponse(cacheHit);
      return;
    }

    if (searchString.length >= props.minimumAmountOfCharacters) {
      setLoading(true);
      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = setTimeout(async () => {
          const response = await props.dataProvider(searchString);
          if (response.ok) {
            setLoading(false);
            localCache.current.set(searchString, response.value!);
            console.log(response.value);
            setResponse(response.value);
          }
        }, 500) as unknown as number;
      }
    } else {
      setResponse(null);
    }
  }, []);

  const renderOptions = () => {
    const res = response ?? [];
    if (res.length > 0) {
      return res.map((r: AutoCompleteItem) => comboOption(r, props));
    }

    return (
      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
        Nothing found.
      </div>
    );
  };
  const optionsClassname =
    'list-none absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm';

  return (
    <div className="w-72 relative">
      <Combobox
        value={selected}
        disabled={props.ready === false}
        onChange={async (u: any) => {
          setSelected(u);
          if (props.onItemSelected) {
            const res = props.onItemSelected(u.original);
            if (res instanceof Promise) {
              setLoading(true);
              await res;
              setSelected(null);
              setLoading(false);
            }
          }
        }}
      >
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              id={props.id}
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              displayValue={(item: AutoCompleteItem) => item?.label}
              onChange={event => handleInputChanged(event.target.value)}
              placeholder={props.placeholder}
              onFocus={props.onFocus}
              onBlur={() => {
                setSelected(null);
              }}
            />
            {!loading && (
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <IconArrowDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </Combobox.Button>
            )}
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div>
              <Combobox.Options className={optionsClassname}>{renderOptions()}</Combobox.Options>
            </div>
          </Transition>
        </div>
        {loading && (
          <div className="scale-[0.8] absolute right-0 p-2 top-[-5px]">
            <Loading />
          </div>
        )}
      </Combobox>
    </div>
  );
};

export default InputAutoComplete;

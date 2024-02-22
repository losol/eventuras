'use client';
import { UserDto } from '@eventuras/sdk';
import { Combobox, Transition } from '@headlessui/react';
import { IconArrowDown } from '@tabler/icons-react';
import React, { Fragment, useCallback, useRef, useState } from 'react';

import { ApiResult } from '@/utils/api/EventurasApi';

import Loading from '@eventuras/ui/Loading';
import formStyles from './src/formStyles';

export type InputTextProps = {
  [x: string]: any;
};
/**
 * Basic text input field
 * requires ref forwarding because it is used by react hooks
 * @see https://stackoverflow.com/questions/67877887/react-hook-form-v7-function-components-cannot-be-given-refs-attempts-to-access
 */

export const LegacyInputText = React.forwardRef<HTMLInputElement, InputTextProps>((props, ref) => {
  const oProps = { ...props };
  delete oProps.children;
  delete oProps.type;
  delete oProps.className;
  const id = props.id ?? props.name;
  return (
    <div className="mb-3">
      {props.label && !props.hidden && <label htmlFor={id}>{props.label}</label>}
      <input
        id={id}
        ref={ref}
        className={`${props.className ?? formStyles.defaultInputStyle}`}
        type={props.type ?? 'text'}
        placeholder={props.placeholder}
        {...oProps}
      />
      {props.errors && (
        <label htmlFor={id} role="alert" className="text-red-500">
          {props.errors[props.name]?.message}
        </label>
      )}
    </div>
  );
});

LegacyInputText.displayName = 'InputText';

export const InputDate = React.forwardRef<HTMLInputElement, InputTextProps>((props, ref) => {
  const oProps = { ...props };
  delete oProps.children;
  delete oProps.type;
  delete oProps.className;
  const id = props.id ?? props.name;
  return (
    <div className="mb-3">
      {props.label && <label htmlFor={id}>{props.label}</label>}
      <input
        id={id}
        ref={ref}
        className={`${props.className ?? ''}`}
        type="date"
        placeholder={props.placeholder}
        {...oProps}
      />
      {props.errors && (
        <label htmlFor={id} role="alert" className="text-red-500">
          {props.errors[props.name]?.message}
        </label>
      )}
    </div>
  );
});
InputDate.displayName = 'InputDate';

export type DataProviderResponse = {
  data?: Array<any> | null;
};

export type AutoCompleteDataProvider = (options: {
  query?: string;
}) => Promise<ApiResult<DataProviderResponse>>;

export type InputAutoCompleteProps = {
  id: string;
  resetAfterSelect?: boolean;
  placeholder?: string;
  dataProvider: AutoCompleteDataProvider;
  minimumAmountOfCharacters: number;
  labelProperty: string;
  onItemSelected?: (u: any) => void;
};

const comboOption = (person: UserDto) => (
  <Combobox.Option
    key={person.id}
    className={({ active }) =>
      `relative cursor-default select-none py-2 pl-5 pr-4 ${
        active ? 'bg-blue-600 text-white' : 'text-gray-900'
      }`
    }
    value={person}
  >
    {({ selected, active }) => (
      <>
        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
          {person.name}
        </span>
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

export const InputAutoComplete = (props: InputAutoCompleteProps) => {
  const [selected, setSelected] = useState<UserDto | null>(null);
  const intervalId = useRef(-1);
  const [response, setResponse] = useState<DataProviderResponse | null>(null);
  const localCache = useRef<Map<string, DataProviderResponse>>(new Map());
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
          const userResponse = await props.dataProvider({ query: searchString });
          if (userResponse.ok) {
            setLoading(false);
            localCache.current.set(searchString, userResponse.value!);
            setResponse(userResponse.value);
          }
        }, 500) as unknown as number;
      }
    } else {
      setResponse(null);
    }
  }, []);

  const renderOptions = () => {
    const persons = response?.data ?? [];
    if (persons.length > 0) {
      return persons.map((person: UserDto) => comboOption(person));
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
        onChange={(u: any) => {
          setSelected(u);
          if (props.onItemSelected) {
            props.onItemSelected(u);
          }
        }}
      >
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              displayValue={(person: any) => person?.name}
              onChange={event => handleInputChanged(event.target.value)}
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
            <div style={{ display: !response?.data?.length ? 'none' : 'block' }}>
              <Combobox.Options className={optionsClassname}>{renderOptions()}</Combobox.Options>
            </div>
          </Transition>
        </div>
        {loading && (
          <div className="scale-[0.8] mt-[-2px] absolute right-0 p-2 top-[-5px]">
            <Loading />
          </div>
        )}
      </Combobox>
    </div>
  );
};

export const DebouncedInput = ({
  value: initialValue,
  onChange,
  className,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  className?: string;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) => {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      {...props}
      className={className ?? formStyles.defaultInputStyle}
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
};

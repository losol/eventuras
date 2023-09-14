'use client';
import { UserDto } from '@losol/eventuras/models/UserDto';
import React, { useRef, useState } from 'react';

import { ApiResult } from '@/utils/api';

import Loading from '../feedback/Loading';

export type InputTextProps = {
  [x: string]: any;
};
/**
 * Basic text input field
 * requires ref forwarding because it is used by react hooks
 * @see https://stackoverflow.com/questions/67877887/react-hook-form-v7-function-components-cannot-be-given-refs-attempts-to-access
 */
const defaultClass = ` 
        appearance-none
        w-full 
        p-4
        text-gray-900
        dark:text-gray-100
        bg-gray-100
        dark:bg-gray-800
        border-2
        dark:border-gray-700
        leading-tight 
        focus:outline-none 
        focus:shadow-outline`;

export const InputText = React.forwardRef<HTMLInputElement, InputTextProps>((props, ref) => {
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
        className={`${props.className ?? ''} 
        ${defaultClass}`}
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

InputText.displayName = 'InputText';

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
        className={`${props.className ?? ''} 
        ${defaultClass}`}
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
  placeholder?: string;
  dataProvider: AutoCompleteDataProvider;
  minimumAmountOfCharacters: number;
  labelProperty: string;
  onItemSelected?: (u: any) => void;
};

export const InputAutoComplete = (props: InputAutoCompleteProps) => {
  const intervalId = useRef(-1);
  const inputRef = useRef(null);
  const [response, setResponse] = useState<DataProviderResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  //caches results per search string
  const localCache = useRef<Map<string, DataProviderResponse>>(new Map());

  const clearTextHandler = () => {
    if (inputRef) {
      (inputRef.current as any).value = '';
    }
  };

  const handleOptionSelected = (optionId: string) => {
    if (inputRef.current) {
      const data = response?.data ?? [];
      const selectedUser: any = data.filter(val => val.id === optionId)[0];
      (inputRef.current as any).value = selectedUser[props.labelProperty];

      if (props.onItemSelected) props.onItemSelected(selectedUser);
    }
  };

  const handleInputChanged = (searchString: string) => {
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
            localCache.current.set(searchString, userResponse.value);
            setResponse(userResponse.value);
          }
        }, 500) as unknown as number;
      }
    }
  };

  const inputChangeHandler = (e: React.FormEvent<HTMLInputElement>) => {
    // This checks the source of the change, 'insertReplacementText'
    // though not exposed through React typing (hence cast to any), is in fact browser supported
    // if the source is the data option, it needs to prevent another network call being put out
    if ((e.nativeEvent as any).inputType === 'insertReplacementText') {
      handleOptionSelected(e.currentTarget.value);
    } else {
      handleInputChanged(e.currentTarget.value);
    }
  };
  return (
    <div className="relative">
      <InputText
        ref={inputRef}
        id={props.id}
        list={`${props.id}_list`}
        placeholder={props.placeholder}
        onChange={inputChangeHandler}
      />

      {loading && (
        <div className="scale-[0.8] mt-[-2px] absolute right-0 p-2 top-1">
          <Loading />
        </div>
      )}
      {!loading && (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key == 'Escape') {
              clearTextHandler();
            }
          }}
          className="block bg-black  p-2 absolute right-1 top-1 rounded cursor-pointer bg-opacity-70"
          onClick={clearTextHandler}
        >
          <span className="pointer-events-none">&#x2715;</span>
        </div>
      )}

      <datalist id={`${props.id}_list`}>
        {response?.data &&
          response.data.map((val: UserDto) => (
            <option value={val.id!} label={val.name!} key={val.id!}></option>
          ))}
      </datalist>
    </div>
  );
};

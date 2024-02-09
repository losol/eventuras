import { Listbox, Transition } from '@headlessui/react';
import { IconCheck, IconSelector } from '@tabler/icons-react';
import { Fragment, useState } from 'react';
import { Controller } from 'react-hook-form';

import { TEST_ID_ATTRIBUTE } from '@/utils/constants';

export type DropdownSelectProps = {
  multiSelect: boolean;
  className: string;
  label: string;
  name: string;
  control: any;
  errors: any;
  rules: any;
  options: any;
  [TEST_ID_ATTRIBUTE]?: string;
};
export default function DropdownSelect(props: DropdownSelectProps) {
  const { control, options, rules, label, className, multiSelect, name, errors } = props;
  return (
    <div className={className}>
      <label htmlFor="statusSelector">{label}</label>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => {
          return (
            <Dropdown
              multiSelect={multiSelect}
              id={name}
              options={options}
              onChange={onChange}
              onBlur={onBlur}
              selected={value ?? []}
              data-test-id={props[TEST_ID_ATTRIBUTE]}
            />
          );
        }}
      />
      {errors[name] && (
        <label htmlFor={name} role="alert" className="text-red-500">
          {errors[name]?.message}
        </label>
      )}
    </div>
  );
}

export type DropdownOption = {
  id: string;
  label: string;
};

export type DropdownProps = {
  id: string;
  multiSelect: boolean;
  options: DropdownOption[];
  onChange: (selected: string[] | string) => void;
  onBlur: (event: any) => void;
  selected: string[] | string; //array of ids for multiSelect
  [TEST_ID_ATTRIBUTE]?: string;
};

export function Dropdown(props: DropdownProps) {
  const {
    id,
    options,
    onChange,
    multiSelect,
    onBlur,
  } = props;

  const selectedDefaultValue = multiSelect ? [] : (options.length > 0 ? options[0]!.id : '');

  const [selected, setSelected] = useState<string | string[]>(props.selected || selectedDefaultValue);

  const renderSelection = () => {
    if (multiSelect) {
      const s = selected as string[];
      const o = options as DropdownOption[];
      return s.map(id => o.find(opt => opt.id === id)?.label || '').join(', ');
    } else {
      return options.find(o => o.id === selected)?.label || '';
    }
  };
  return (
    <div id={id}>
      <Listbox value={selected} onChange={onChange} multiple={multiSelect}>
        <div className="relative mt-1 text-black">
          <Listbox.Button
            data-test-id={props[TEST_ID_ATTRIBUTE]}
            onBlur={onBlur}
            className="relative border-2 bg-gray-100 w-full cursor-default bg-white py-4 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm"
          >
            <span className="block truncate">{renderSelection()}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <IconSelector className="h-15 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="list-none absolute mt-1 max-h-60 w-full overflow-auto bg-white py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map(option => (
                <Listbox.Option
                  data-test-id={option.id}
                  key={option.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-5 pr-4 ${
                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                    }`
                  }
                  value={option.id}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <IconCheck className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}

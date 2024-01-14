import { Listbox } from '@headlessui/react';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Label from './Label';

export type SelectProps = {
  label?: string;
  name: string;
  id?: string;
  options: { value: string; label: string }[];
  dataTestId?: string;
};

const styles = {
  wrapper: 'w-full',
  button: 'w-full bg-gray-100 dark:bg-gray-900 text-black dark:text-white p-4 text-left',
  options:
    'mt-1 max-h-60 w-full overflow-auto bg-white dark:bg-gray-800 shadow-lg text-black dark:text-white py-1 z-20 list-none',
  option: {
    base: 'select-none cursor-default p-2 hover:bg-primary-200 dark:hover:bg-primary-700',
    active: 'text-bold',
    inactive: '',
  },
};

const Select: React.FC<SelectProps> = ({ label, name, options, dataTestId }) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <div className={styles.wrapper}>
          {label && <Label htmlFor={name}>{label}</Label>}
          <Listbox value={value} onChange={onChange}>
            <Listbox.Button
              className={styles.button}
              id={`${name}-button`}
              data-test-id={`${dataTestId}-button`}
            >
              {options.find(option => option.value === value)?.label ?? 'Select an option'}
            </Listbox.Button>
            <Listbox.Options className={styles.options}>
              {options.map(option => (
                <Listbox.Option key={option.value} value={option.value} as={React.Fragment}>
                  {({ active }) => (
                    <li
                      className={
                        styles.option.base +
                        (active ? ` ${styles.option.active}` : ` ${styles.option.inactive}`)
                      }
                    >
                      {option.label}
                    </li>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
        </div>
      )}
    />
  );
};

export default Select;

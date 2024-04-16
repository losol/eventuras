import { Listbox } from '@headlessui/react';
import { IconChevronDown } from '@tabler/icons-react';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { InputLabel } from '@eventuras/forms';
import { DATA_TEST_ID } from '@eventuras/utils';

export type SelectProps = {
  label?: string;
  name: string;
  options: { value: string; label: string }[];
  [DATA_TEST_ID]?: string;
};

const styles = {
  wrapper: 'w-full',
  button: {
    base: 'w-full flex bg-gray-100 dark:bg-gray-900 text-black dark:text-white p-4 text-left',
    icon: 'justify-items-end h-5 w-5 text-violet-200 hover:text-violet-100',
  },
  options:
    'relative inline-block justify-center mt-1 max-h-60 w-full overflow-auto bg-white dark:bg-gray-800 shadow-lg text-black dark:text-white py-1 z-20 list-none',
  option: {
    base: 'select-none cursor-default p-2 hover:bg-primary-200 dark:hover:bg-primary-700',
    active: 'text-bold',
    inactive: '',
  },
};

const Select: React.FC<SelectProps> = (props) => {
  const { label, name, options } = props
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <div className={styles.wrapper}>
          {label && <InputLabel htmlFor={name}>{label}</InputLabel>}
          <Listbox value={value} onChange={onChange}>
            <Listbox.Button
              className={styles.button.base}
              id={`${name}`}
              {...{ [DATA_TEST_ID]: props[DATA_TEST_ID] }}
            >
              {options.find(option => option.value === value)?.label ?? 'Select an option'}

              <IconChevronDown className="{styles.button.icon}  " aria-hidden="true" />
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

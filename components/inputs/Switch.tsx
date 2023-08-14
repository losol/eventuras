'use client';

import { Switch as HeadlessSwitch } from '@headlessui/react';
import React from 'react';

type SwitchProps = {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Switch = (props: SwitchProps): React.JSX.Element => {
  return (
    <HeadlessSwitch.Group>
      <div className="flex items-center">
        <HeadlessSwitch.Label className="mr-4 dark:text-gray-100">
          {props.label}
        </HeadlessSwitch.Label>
        <HeadlessSwitch
          checked={props.checked}
          onChange={props.onChange}
          className={`${
            props.checked ? 'bg-gray-700 dark:bg-gray-700' : 'bg-gray-900 dark:bg-teal-800'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        >
          <span
            className={`${
              props.checked ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </HeadlessSwitch>
      </div>
    </HeadlessSwitch.Group>
  );
};

export default Switch;

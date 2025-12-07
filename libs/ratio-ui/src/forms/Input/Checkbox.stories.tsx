import { Meta } from '@storybook/react-vite';
import React from 'react';

import Checkbox, { CheckboxProps } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
};

export default meta;

export const Default: React.FC<CheckboxProps> = () => (
  <Checkbox id="default" defaultChecked={false} disabled={false}>
    <Checkbox.Label>Label Here</Checkbox.Label>
    <Checkbox.Description>Description Here</Checkbox.Description>
  </Checkbox>
);

export const CheckedByDefault: React.FC<CheckboxProps> = () => (
  <Checkbox id="checked-by-default" defaultChecked={true} disabled={false}>
    <Checkbox.Label>Label Here</Checkbox.Label>
    <Checkbox.Description>Description Here</Checkbox.Description>
  </Checkbox>
);

export const Disabled: React.FC<CheckboxProps> = () => (
  <Checkbox id="disabled" defaultChecked={false} disabled={true}>
    <Checkbox.Label>Label Here</Checkbox.Label>
    <Checkbox.Description>Description Here</Checkbox.Description>
  </Checkbox>
);

export const WithCustomStyles: React.FC<CheckboxProps> = () => (
  <Checkbox id="custom" className="w-6 h-6 text-red-600 bg-red-100" containerClassName="my-4">
    <Checkbox.Label className="font-bold ml-2 text-red-500">Label Here</Checkbox.Label>
    <Checkbox.Description>Description Here</Checkbox.Description>
  </Checkbox>
);

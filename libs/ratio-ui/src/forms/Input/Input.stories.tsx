import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Forms/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    multiline: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

/** Default text input */
export const Default: Story = {
  args: {
    name: 'firstName',
    label: 'First Name',
    placeholder: 'Enter your first name',
    description: 'This is a standard text input',
  },
};

/** Disabled input */
export const Disabled: Story = {
  args: {
    name: 'firstName',
    label: 'First Name',
    placeholder: 'Disabled input',
    disabled: true,
  },
};

/** With error message */
export const WithError: Story = {
  args: {
    name: 'email',
    label: 'Email Address',
    placeholder: 'Enter your email',
    errors: { email: 'Invalid email address' },
  },
};

/** Multiline textarea */
export const Multiline: Story = {
  args: {
    name: 'bio',
    label: 'Bio',
    placeholder: 'Write something about yourself...',
    description: 'This field allows multiple lines.',
    multiline: true,
    rows: 4,
  },
};

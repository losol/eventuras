import { Meta, StoryFn } from '@storybook/react-vite';
import { Toast, type ToastData } from '.';
import { useState } from 'react';

const meta: Meta<typeof Toast> = {
  component: Toast,
  tags: ['autodocs'],
};

export default meta;

type ToastStory = StoryFn<typeof Toast>;

export const Playground: ToastStory = () => {
  const [toasts] = useState<ToastData[]>([
    { id: '1', message: 'This is an info toast', status: 'info' },
  ]);

  return <Toast toasts={toasts} />;
};

export const SuccessToast: ToastStory = () => {
  const [toasts] = useState<ToastData[]>([
    { id: '1', message: 'Operation completed successfully!', status: 'success' },
  ]);

  return <Toast toasts={toasts} />;
};

export const ErrorToast: ToastStory = () => {
  const [toasts] = useState<ToastData[]>([
    { id: '1', message: 'An error occurred. Please try again.', status: 'error' },
  ]);

  return <Toast toasts={toasts} />;
};

export const WarningToast: ToastStory = () => {
  const [toasts] = useState<ToastData[]>([
    { id: '1', message: 'Heads up: this is a warning.', status: 'warning' },
  ]);

  return <Toast toasts={toasts} />;
};

export const MultipleToasts: ToastStory = () => {
  const [toasts] = useState<ToastData[]>([
    { id: '1', message: 'First toast message', status: 'info' },
    { id: '2', message: 'Second toast message', status: 'success' },
    { id: '3', message: 'Third toast message', status: 'error' },
  ]);

  return <Toast toasts={toasts} />;
};

export const LongMessage: ToastStory = () => {
  const [toasts] = useState<ToastData[]>([
    {
      id: '1',
      message:
        'This is a much longer toast message that demonstrates how the toast component handles longer text content.',
      status: 'info',
    },
  ]);

  return <Toast toasts={toasts} />;
};

import { Meta, StoryFn } from '@storybook/react-vite';
import { Toast, ToastType, Toast as ToastInterface } from './Toast';
import { useState } from 'react';

const meta: Meta<typeof Toast> = {
  component: Toast,
  tags: ['autodocs'],
};

export default meta;

type ToastStory = StoryFn<typeof Toast>;

export const Playground: ToastStory = () => {
  const [toasts] = useState<ToastInterface[]>([
    { id: '1', message: 'This is an info toast', type: ToastType.INFO },
  ]);

  return <Toast toasts={toasts} />;
};

export const SuccessToast: ToastStory = () => {
  const [toasts] = useState<ToastInterface[]>([
    { id: '1', message: 'Operation completed successfully!', type: ToastType.SUCCESS },
  ]);

  return <Toast toasts={toasts} />;
};

export const ErrorToast: ToastStory = () => {
  const [toasts] = useState<ToastInterface[]>([
    { id: '1', message: 'An error occurred. Please try again.', type: ToastType.ERROR },
  ]);

  return <Toast toasts={toasts} />;
};

export const InfoToast: ToastStory = () => {
  const [toasts] = useState<ToastInterface[]>([
    { id: '1', message: 'Here is some information for you.', type: ToastType.INFO },
  ]);

  return <Toast toasts={toasts} />;
};

export const MultipleToasts: ToastStory = () => {
  const [toasts] = useState<ToastInterface[]>([
    { id: '1', message: 'First toast message', type: ToastType.INFO },
    { id: '2', message: 'Second toast message', type: ToastType.SUCCESS },
    { id: '3', message: 'Third toast message', type: ToastType.ERROR },
  ]);

  return <Toast toasts={toasts} />;
};

export const LongMessage: ToastStory = () => {
  const [toasts] = useState<ToastInterface[]>([
    {
      id: '1',
      message:
        'This is a much longer toast message that demonstrates how the toast component handles longer text content.',
      type: ToastType.INFO,
    },
  ]);

  return <Toast toasts={toasts} />;
};

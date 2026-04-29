import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AlertDialog, AlertDialogProps, AlertDialogVariant } from './AlertDialog';
import { Button } from '../../core/Button';

const meta: Meta<AlertDialogProps> = {
  title: 'Layout/AlertDialog',
  component: AlertDialog,
  args: {
    isOpen: true,
    onClose: () => {},
    onPrimaryAction: () => {},
    title: 'Publish Document',
    children: 'Would you like to publish this document?',
    variant: 'confirmation',
    primaryActionLabel: 'Publish',
    secondaryActionLabel: 'Save Draft',
    cancelLabel: 'Cancel',
  },
};
export default meta;

type Story = StoryObj<AlertDialogProps>;

type StatefulAlertDialogProps = Omit<
  AlertDialogProps,
  'isOpen' | 'onClose' | 'onPrimaryAction' | 'onSecondaryAction' | 'onCancel'
>;

const StatefulAlertDialog = (args: StatefulAlertDialogProps) => {
  const [open, setOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <Button onClick={() => setOpen(true)}>Open AlertDialog</Button>
      {lastAction && <p className="text-sm text-gray-600">Last action: {lastAction}</p>}
      <AlertDialog
        {...args}
        isOpen={open}
        onClose={() => setOpen(false)}
        onPrimaryAction={() => setLastAction('primary')}
        onSecondaryAction={
          args.secondaryActionLabel ? () => setLastAction('secondary') : undefined
        }
        onCancel={() => setLastAction('cancel')}
      />
    </div>
  );
};

export const Confirmation: Story = {
  render: args => <StatefulAlertDialog {...args} />,
};

export const Destructive: Story = {
  render: args => <StatefulAlertDialog {...args} />,
  args: {
    variant: 'destructive',
    title: 'Delete event?',
    children: 'This will permanently remove the event and all registrations. This cannot be undone.',
    primaryActionLabel: 'Delete',
    secondaryActionLabel: undefined,
    cancelLabel: 'Cancel',
  },
};

export const Information: Story = {
  render: args => <StatefulAlertDialog {...args} />,
  args: {
    variant: 'information',
    title: 'Heads up',
    children: 'Your subscription will renew on May 1st.',
    primaryActionLabel: 'OK',
    secondaryActionLabel: undefined,
    cancelLabel: undefined,
  },
};

export const Warning: Story = {
  render: args => <StatefulAlertDialog {...args} />,
  args: {
    variant: 'warning',
    title: 'Unsaved changes',
    children: 'You have unsaved changes that will be lost if you continue.',
    primaryActionLabel: 'Discard',
    cancelLabel: 'Keep editing',
    secondaryActionLabel: undefined,
  },
};

const VariantsDemo = () => {
  const variants: AlertDialogVariant[] = [
    'confirmation',
    'information',
    'destructive',
    'error',
    'warning',
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {variants.map(v => (
        <StatefulAlertDialog
          key={v}
          variant={v}
          title={`Variant: ${v}`}
          primaryActionLabel="Confirm"
          cancelLabel="Cancel"
        >
          <p>This is an alert dialog with variant=&quot;{v}&quot;.</p>
        </StatefulAlertDialog>
      ))}
    </div>
  );
};

export const Variants: Story = {
  render: () => <VariantsDemo />,
};

export const ThreeButtons: Story = {
  render: args => <StatefulAlertDialog {...args} />,
  args: {
    title: 'Publish Document',
    children: 'Would you like to publish this document?',
    primaryActionLabel: 'Publish',
    secondaryActionLabel: 'Save Draft',
    cancelLabel: 'Cancel',
  },
};

export const PrimaryDisabled: Story = {
  render: args => <StatefulAlertDialog {...args} />,
  args: {
    title: 'Confirm action',
    children: 'The primary action is disabled in this story.',
    primaryActionLabel: 'Confirm',
    cancelLabel: 'Cancel',
    secondaryActionLabel: undefined,
    isPrimaryActionDisabled: true,
  },
};

export const AutoFocusCancel: Story = {
  render: args => <StatefulAlertDialog {...args} />,
  args: {
    variant: 'confirmation',
    title: 'Are you sure?',
    children: 'Cancel is auto-focused regardless of variant.',
    primaryActionLabel: 'Continue',
    cancelLabel: 'Cancel',
    secondaryActionLabel: undefined,
    autoFocusButton: 'cancel',
  },
};

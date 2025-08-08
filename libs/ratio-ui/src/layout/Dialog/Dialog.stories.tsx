import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Dialog, DialogProps } from './Dialog';
import { Button } from '../../core/Button';

const meta: Meta<DialogProps> = {
  title: 'Layout/Dialog',
  component: Dialog,
  args: {
    title: 'Example Dialog',
    children: <p>This is a dialog body.</p>,
    isOpen: true,
  },
};
export default meta;

type Story = StoryObj<DialogProps>;

/**
 * Helper wrapper to handle open/close state
 */
const StatefulDialog = (args: Omit<DialogProps, 'isOpen' | 'onClose'>) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Open dialog button */}
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>

      {/* Dialog with state control */}
      <Dialog {...args} isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};

/**
 * Default open dialog
 */
export const Default: Story = {
  args: {
    title: 'Default Dialog',
    children: (
      <div>
        <p>This is the default dialog content.</p>
      </div>
    ),
  },
};

/**
 * Dialog opened via button click
 */
export const WithTriggerButton: Story = {
  render: args => <StatefulDialog {...args} />,
  args: {
    title: 'Interactive Dialog',
    children: (
      <>
        <p>Click outside or press ESC to close.</p>
        <p>You can put any JSX inside here.</p>
      </>
    ),
  },
};

/**
 * Dialog with long scrolling content
 */
export const LongContent: Story = {
  render: args => <StatefulDialog {...args} />,
  args: {
    title: 'Dialog with Long Content',
    children: (
      <div className="space-y-4">
        {[...Array(20)].map((_, i) => (
          <p key={i}>This is line {i + 1} inside a long dialog.</p>
        ))}
      </div>
    ),
  },
};

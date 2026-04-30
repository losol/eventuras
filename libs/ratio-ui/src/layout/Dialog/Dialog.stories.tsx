import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Dialog, DialogProps, DialogSize } from './Dialog';
import { Button } from '../../core/Button';

const meta: Meta<DialogProps> = {
  title: 'Layout/Dialog',
  component: Dialog,
  args: {
    isOpen: true,
    onClose: () => {},
  },
};
export default meta;

type Story = StoryObj<DialogProps>;

const StatefulDialog = (args: Omit<DialogProps, 'isOpen' | 'onClose' | 'children'>) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog {...args} isOpen={open} onClose={() => setOpen(false)}>
        <Dialog.Heading>Interactive Dialog</Dialog.Heading>
        <Dialog.Content>
          <p>Click outside or press ESC to close.</p>
          <p>You can put any JSX inside here.</p>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

export const Default: Story = {
  render: args => (
    <Dialog {...args}>
      <Dialog.Heading>Default Dialog</Dialog.Heading>
      <Dialog.Content>
        <p>This is the default dialog content.</p>
      </Dialog.Content>
    </Dialog>
  ),
};

export const WithTriggerButton: Story = {
  render: args => <StatefulDialog {...args} />,
};

const FooterDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog isOpen={open} onClose={() => setOpen(false)}>
        <Dialog.Heading>Save changes?</Dialog.Heading>
        <Dialog.Content>
          <p>Your edits will be applied to all participants.</p>
        </Dialog.Content>
        <Dialog.Footer>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Save</Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
};

export const WithFooter: Story = {
  render: () => <FooterDemo />,
};

/**
 * All size variants side by side. Each button opens a dialog of the
 * corresponding width so layouts with wider forms can pick what fits.
 */
export const Sizes: Story = {
  render: () => {
    const sizes: DialogSize[] = ['sm', 'md', 'lg', 'xl'];
    const Trigger = ({ size }: { size: DialogSize }) => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>size=&quot;{size}&quot;</Button>
          <Dialog isOpen={open} onClose={() => setOpen(false)} size={size}>
            <Dialog.Heading>Dialog ({size})</Dialog.Heading>
            <Dialog.Content>
              <p>This panel uses size=&quot;{size}&quot;.</p>
            </Dialog.Content>
          </Dialog>
        </>
      );
    };
    return (
      <div className="flex gap-3">
        {sizes.map(s => (
          <Trigger key={s} size={s} />
        ))}
      </div>
    );
  },
};

const LongContentDemo = (args: Omit<DialogProps, 'isOpen' | 'onClose' | 'children'>) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog {...args} isOpen={open} onClose={() => setOpen(false)}>
        <Dialog.Heading>Dialog with Long Content</Dialog.Heading>
        <Dialog.Content>
          <div className="space-y-4">
            {[...Array(20)].map((_, i) => (
              <p key={i}>This is line {i + 1} inside a long dialog.</p>
            ))}
          </div>
        </Dialog.Content>
      </Dialog>
    </>
  );
};

export const LongContent: Story = {
  render: args => <LongContentDemo {...args} />,
};

const NonDismissableDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog isOpen={open} onClose={() => setOpen(false)} isDismissable={false}>
        <Dialog.Heading>Action required</Dialog.Heading>
        <Dialog.Content>
          <p>
            Clicking the backdrop will not close this dialog. Press Escape or click Continue to
            proceed. Add <code>isKeyboardDismissDisabled</code> too if you also need to disable
            Escape.
          </p>
        </Dialog.Content>
        <Dialog.Footer>
          <Button onClick={() => setOpen(false)}>Continue</Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
};

/**
 * Dialog that can't be closed by clicking the backdrop. Useful for forced
 * confirmation flows where the user must take an explicit action. Pair with
 * `isKeyboardDismissDisabled` to also disable Escape.
 */
export const NonDismissable: Story = {
  render: () => <NonDismissableDemo />,
};

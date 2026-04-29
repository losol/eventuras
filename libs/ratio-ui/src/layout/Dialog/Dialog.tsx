import { Overlay } from '@react-aria/overlays';
import { ReactNode } from 'react';
import { Dialog as AriaDialog, Heading as AriaHeading } from 'react-aria-components';
import { buildSpacingClasses } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

// Tailwind max-w utilities (28 / 32 / 42 / 56 rem). All four class
// names are safelisted via `@source inline(...)` in
// libs/ratio-ui/src/global.css because the lookup is dynamic — keep
// that list in sync if you add sizes here.
const sizeClasses: Record<DialogSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Max width of the dialog panel. Defaults to 'md' (~512px). */
  size?: DialogSize;
  testId?: string;
  /** Sets `role="alertdialog"` for prompts that interrupt the user. */
  role?: 'dialog' | 'alertdialog';
}

const DialogRoot = ({
  isOpen,
  onClose,
  children,
  size,
  testId,
  role = 'dialog',
}: Readonly<DialogProps>) => {
  if (!isOpen) {
    return null;
  }

  const panelWidth = sizeClasses[size ?? 'md'];

  return (
    <Overlay>
      <div
        data-testid={testId}
        className="flex min-h-full min-w-full items-start justify-center p-4 text-center fixed inset-0 z-100 overflow-auto h-full bg-black/50"
        role="presentation"
        onClick={e => {
          if (e.target === e.currentTarget) onClose();
        }}
        onKeyDown={e => {
          if (e.key === 'Escape') onClose();
        }}
      >
        <div
          className={`w-full ${panelWidth} transform overflow-hidden rounded-2xl bg-white dark:bg-slate-700 dark:text-white p-6 text-left align-middle shadow-xl transition-all`}
        >
          <AriaDialog role={role} className="relative z-10">
            {children}
          </AriaDialog>
        </div>
      </div>
    </Overlay>
  );
};

interface DialogSlotProps {
  children?: ReactNode;
  className?: string;
}

function DialogHeading({ children, className }: Readonly<DialogSlotProps>) {
  return (
    <AriaHeading
      slot="title"
      level={3}
      className={cn(
        'text-gray-800 dark:text-gray-200',
        buildSpacingClasses({ paddingBottom: 'xs' }),
        className,
      )}
    >
      {children}
    </AriaHeading>
  );
}

function DialogContent({ children, className }: Readonly<DialogSlotProps>) {
  return <div className={className}>{children}</div>;
}

function DialogFooter({ children, className }: Readonly<DialogSlotProps>) {
  return <div className={cn('mt-4 flex justify-end gap-2', className)}>{children}</div>;
}

export const Dialog = Object.assign(DialogRoot, {
  Heading: DialogHeading,
  Content: DialogContent,
  Footer: DialogFooter,
});

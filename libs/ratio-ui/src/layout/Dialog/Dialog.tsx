import { ReactNode } from 'react';
import {
  Dialog as AriaDialog,
  Heading as AriaHeading,
  Modal,
  ModalOverlay,
} from 'react-aria-components';
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
  /**
   * Whether clicking the backdrop closes the dialog. Defaults to true.
   * Pair with `isKeyboardDismissDisabled` to fully prevent dismissal.
   */
  isDismissable?: boolean;
  /** When true, Escape no longer closes the dialog. Defaults to false. */
  isKeyboardDismissDisabled?: boolean;
}

const DialogRoot = ({
  isOpen,
  onClose,
  children,
  size,
  testId,
  role = 'dialog',
  isDismissable = true,
  isKeyboardDismissDisabled = false,
}: Readonly<DialogProps>) => {
  const panelWidth = sizeClasses[size ?? 'md'];

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      data-testid={testId}
      className="flex min-h-full min-w-full items-start justify-center p-4 text-center fixed inset-0 z-100 overflow-auto h-full bg-black/50"
    >
      <Modal
        className={cn(
          'w-full',
          panelWidth,
          'transform overflow-hidden rounded-2xl bg-white dark:bg-slate-700 dark:text-white',
          'p-6 text-left align-middle shadow-xl transition-all',
        )}
      >
        <AriaDialog role={role} className="relative z-10 outline-hidden">
          {children}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
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

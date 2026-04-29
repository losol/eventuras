import { ReactNode, useEffect, useRef } from 'react';
import { Button } from '../../core/Button';
import { Dialog, DialogProps, DialogSize } from './Dialog';

export type AlertDialogVariant =
  | 'confirmation'
  | 'information'
  | 'destructive'
  | 'error'
  | 'warning';

export type AlertDialogAutoFocus = 'primary' | 'secondary' | 'cancel';

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: AlertDialogVariant;
  size?: DialogSize;
  testId?: string;

  primaryActionLabel: string;
  secondaryActionLabel?: string;
  cancelLabel?: string;

  isPrimaryActionDisabled?: boolean;
  isSecondaryActionDisabled?: boolean;

  autoFocusButton?: AlertDialogAutoFocus;

  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
  onCancel?: () => void;
}

const variantPrimaryStyle: Record<AlertDialogVariant, 'primary' | 'danger'> = {
  confirmation: 'primary',
  information: 'primary',
  warning: 'primary',
  destructive: 'danger',
  error: 'danger',
};

export const AlertDialog = ({
  isOpen,
  onClose,
  title,
  children,
  variant = 'confirmation',
  size = 'sm',
  testId,
  primaryActionLabel,
  secondaryActionLabel,
  cancelLabel,
  isPrimaryActionDisabled,
  isSecondaryActionDisabled,
  autoFocusButton,
  onPrimaryAction,
  onSecondaryAction,
  onCancel,
}: Readonly<AlertDialogProps>) => {
  const primaryRef = useRef<HTMLButtonElement>(null);
  const secondaryRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Default focus: cancel for destructive/error (safer), primary otherwise.
  // `autoFocusButton` overrides the heuristic; either way we fall back to
  // the first rendered + enabled action so we never try to focus a button
  // that doesn't exist or can't receive focus.
  const desiredFocus: AlertDialogAutoFocus =
    autoFocusButton ??
    (variant === 'destructive' || variant === 'error' ? 'cancel' : 'primary');

  const isFocusable: Record<AlertDialogAutoFocus, boolean> = {
    primary: !isPrimaryActionDisabled,
    secondary: Boolean(secondaryActionLabel) && !isSecondaryActionDisabled,
    cancel: Boolean(cancelLabel),
  };

  const fallbackOrder: AlertDialogAutoFocus[] = [
    desiredFocus,
    'cancel',
    'primary',
    'secondary',
  ];
  const focusTarget = fallbackOrder.find(t => isFocusable[t]);

  useEffect(() => {
    if (!isOpen || !focusTarget) return;
    const refs = { primary: primaryRef, secondary: secondaryRef, cancel: cancelRef };
    refs[focusTarget].current?.focus();
  }, [isOpen, focusTarget]);

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const handlePrimary = () => {
    onPrimaryAction();
    onClose();
  };

  const handleSecondary = () => {
    onSecondaryAction?.();
    onClose();
  };

  const dialogProps: Pick<DialogProps, 'isOpen' | 'onClose' | 'size' | 'testId' | 'role'> = {
    isOpen,
    onClose: handleCancel,
    size,
    testId,
    role: 'alertdialog',
  };

  return (
    <Dialog {...dialogProps}>
      <Dialog.Heading>{title}</Dialog.Heading>
      <Dialog.Content>{children}</Dialog.Content>
      <Dialog.Footer>
        {cancelLabel && (
          <Button ref={cancelRef} variant="secondary" onClick={handleCancel}>
            {cancelLabel}
          </Button>
        )}
        {secondaryActionLabel && (
          <Button
            ref={secondaryRef}
            variant="secondary"
            disabled={isSecondaryActionDisabled}
            onClick={handleSecondary}
          >
            {secondaryActionLabel}
          </Button>
        )}
        <Button
          ref={primaryRef}
          variant={variantPrimaryStyle[variant]}
          disabled={isPrimaryActionDisabled}
          onClick={handlePrimary}
        >
          {primaryActionLabel}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
};

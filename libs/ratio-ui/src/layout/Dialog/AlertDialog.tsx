import { ReactNode, useEffect, useId, useRef, useState } from 'react';
import { Button } from '../../core/Button';
import { Input } from '../../forms/Input/Input';
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

  /**
   * Type-to-confirm gate. Renders an input below the message; the
   * primary action stays disabled until the user types this exact
   * phrase. Comparison trims whitespace from both sides and is
   * case-sensitive. An empty or whitespace-only value is treated as
   * "no gate", since a blank phrase couldn't meaningfully gate anything.
   * Reserve for high-risk destructive actions where a click is too easy.
   */
  confirmText?: string;
  /**
   * Visible label rendered above the confirm input, referenced by
   * `aria-labelledby` so non-text ReactNode content stays the source of
   * the accessible name. When omitted, an English `aria-label` fallback
   * is used — pass this prop to localise the instruction.
   */
  confirmLabel?: ReactNode;

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
  confirmText,
  confirmLabel,
  onPrimaryAction,
  onSecondaryAction,
  onCancel,
}: Readonly<AlertDialogProps>) => {
  const primaryRef = useRef<HTMLButtonElement>(null);
  const secondaryRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);
  const confirmInputId = useId();
  const confirmLabelId = useId();

  // Trim both sides so leading/trailing whitespace in either the consumer's
  // `confirmText` or the user's input doesn't cause a phantom mismatch. An
  // empty/whitespace-only `confirmText` is treated as "no gate" — a blank
  // phrase couldn't meaningfully gate anything.
  const trimmedConfirmText = confirmText?.trim();
  const gateActive = trimmedConfirmText !== undefined && trimmedConfirmText !== '';
  const [confirmInput, setConfirmInput] = useState('');
  const confirmMismatch = gateActive && confirmInput.trim() !== trimmedConfirmText;
  const primaryDisabled = isPrimaryActionDisabled || confirmMismatch;
  const hasConfirmLabel = Boolean(confirmLabel);

  // Reset the typed phrase whenever the dialog (re-)opens so reusing the
  // same dialog instance doesn't leak state between confirmations.
  useEffect(() => {
    if (isOpen) setConfirmInput('');
  }, [isOpen]);

  // Default focus: cancel for destructive/error (safer), primary otherwise.
  // `autoFocusButton` overrides the heuristic; either way we fall back to
  // the first rendered + enabled action so we never try to focus a button
  // that doesn't exist or can't receive focus. When `confirmText` is set
  // we focus the input instead — the user has to type before they can act.
  const desiredFocus: AlertDialogAutoFocus =
    autoFocusButton ??
    (variant === 'destructive' || variant === 'error' ? 'cancel' : 'primary');

  const isFocusable: Record<AlertDialogAutoFocus, boolean> = {
    primary: !primaryDisabled,
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
    if (!isOpen) return;
    if (gateActive) {
      confirmInputRef.current?.focus();
      return;
    }
    if (!focusTarget) return;
    const refs = { primary: primaryRef, secondary: secondaryRef, cancel: cancelRef };
    refs[focusTarget].current?.focus();
  }, [isOpen, focusTarget, gateActive]);

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const handlePrimary = () => {
    if (primaryDisabled) return;
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

  const fallbackConfirmLabel = gateActive ? `Type "${trimmedConfirmText}" to confirm` : undefined;

  return (
    <Dialog {...dialogProps}>
      <Dialog.Heading>{title}</Dialog.Heading>
      <Dialog.Content>
        {children}
        {gateActive && (
          <div className="mt-4 flex flex-col gap-2">
            {hasConfirmLabel && (
              <label
                id={confirmLabelId}
                htmlFor={confirmInputId}
                className="text-sm text-(--text)"
              >
                {confirmLabel}
              </label>
            )}
            <Input
              ref={confirmInputRef}
              id={confirmInputId}
              value={confirmInput}
              onChange={e => setConfirmInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !confirmMismatch && !isPrimaryActionDisabled) {
                  e.preventDefault();
                  handlePrimary();
                }
              }}
              placeholder={trimmedConfirmText}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-labelledby={hasConfirmLabel ? confirmLabelId : undefined}
              aria-label={hasConfirmLabel ? undefined : fallbackConfirmLabel}
            />
          </div>
        )}
      </Dialog.Content>
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
          disabled={primaryDisabled}
          onClick={handlePrimary}
        >
          {primaryActionLabel}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
};

import { Heading } from '../../core/Heading';
import { Overlay } from '@react-aria/overlays';
import React, { ReactNode } from 'react';
import { Dialog as AriaDialog } from 'react-aria-components';

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

export type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Max width of the dialog panel. Defaults to 'md' (~512px). */
  size?: DialogSize;
  testId?: string;
};

export const Dialog = (props: DialogProps) => {
  return (
    <DialogModal
      isOpen={props.isOpen}
      testId={props.testId}
      onClickOutside={props.onClose}
      size={props.size}
    >
      <AriaDialog className="relative z-10">
        <Heading as="h3" paddingBottom="xs">
          {props.title}
        </Heading>
        {props.children}
      </AriaDialog>
    </DialogModal>
  );
};

interface DialogModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClickOutside?: () => void;
  size?: DialogSize;
  testId?: string;
}

function DialogModal(props: Readonly<DialogModalProps>) {
  if (!props.isOpen) {
    return null;
  }

  const panelWidth = sizeClasses[props.size ?? 'md'];

  return (
    <Overlay>
      <div
        data-testid={props.testId}
        className="flex min-h-full min-w-full items-start justify-center p-4 text-center fixed inset-0 z-100 overflow-auto h-full bg-black/50"
        id="underlay"
        role="button"
        style={{
          zIndex: 100,
        }}
        onClick={e => {
          const t = e.target as any;
          if (t['id'] === 'underlay') {
            if (props.onClickOutside) props.onClickOutside();
          }
        }}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            if (props.onClickOutside) props.onClickOutside();
          }
        }}
      >
        <div
          className={`w-full ${panelWidth} transform overflow-hidden rounded-2xl bg-white dark:bg-slate-700 dark:text-white p-6 text-left align-middle shadow-xl transition-all`}
        >
          {props.children}
        </div>
      </div>
    </Overlay>
  );
}

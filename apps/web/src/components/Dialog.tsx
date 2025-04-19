import { Heading } from '@eventuras/ratio-ui';
import { DATA_TEST_ID } from '@eventuras/utils';
import { Overlay } from '@react-aria/overlays';
import React, { ReactNode } from 'react';
import { Dialog as RaDialog } from 'react-aria-components';
export type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  [DATA_TEST_ID]?: string;
};

const Dialog = (props: DialogProps) => {
  return (
    <DialogModal
      isOpen={props.isOpen}
      {...{ [DATA_TEST_ID]: props[DATA_TEST_ID] }}
      onClickOutside={props.onClose}
    >
      <RaDialog className="relative z-10">
        <Heading as="h3" spacingClassName="pt-0 pb-3">
          {props.title}
        </Heading>
        {props.children}
      </RaDialog>
    </DialogModal>
  );
};

export default Dialog;

interface DialogModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClickOutside?: () => void;
  [DATA_TEST_ID]?: string;
}

function DialogModal(props: Readonly<DialogModalProps>) {
  if (!props.isOpen) {
    return null;
  }

  return (
    <Overlay>
      <div
        {...{ [DATA_TEST_ID]: props[DATA_TEST_ID] }}
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
        <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-700 dark:text-white p-6 text-left align-middle shadow-xl transition-all">
          {props.children}
        </div>
      </div>
    </Overlay>
  );
}

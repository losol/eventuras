import { Toast } from '@eventuras/ratio-ui/core/Toast';
import { createActorContext } from '@xstate/react';
import { assign, setup, sendTo } from 'xstate';
import { v4 as uuidv4 } from 'uuid';

type ToastMachineContext = { toasts: Toast[]; };

type AddToastEvent = {
  type: 'ADD';
  toast: Omit<Toast, 'id'> & { id?: string; };
};

type RemoveToastEvent = { type: 'REMOVE'; id: string; };

type ToastEvent = AddToastEvent | RemoveToastEvent;

export const toastMachine = setup({
  types: {
    context: {} as ToastMachineContext,
    events: {} as ToastEvent,
  },
}).createMachine({
  id: 'toastMachine',
  context: { toasts: [] },
  on: {
    ADD: {
      actions: [
        // 1) Add toast with stable id and default expiry
        assign({
          toasts: (
            { context, event }: { context: ToastMachineContext; event: ToastEvent; }
          ) => {
            if (event.type !== 'ADD') return context.toasts;
            const id = event.toast.id ?? uuidv4();
            const toast: Toast = {
              ...event.toast,
              id,
              expiresAfter: event.toast.expiresAfter ?? 10_000,
            };
            return [...context.toasts, toast];
          },
        }),
        // 2) Schedule auto-remove using public API; no 'id' function here
        sendTo(
          ({ self }) => self,
          ({ context }: { context: ToastMachineContext; }) => {
            const last = context.toasts[context.toasts.length - 1]!;
            return { type: 'REMOVE', id: last.id } as RemoveToastEvent;
          },
          {
            delay: ({ context }: { context: ToastMachineContext; }) => {
              const last = context.toasts[context.toasts.length - 1]!;
              return last.expiresAfter ?? 10_000;
            },
          }
        ),
      ],
    },
    REMOVE: {
      actions: assign({
        toasts: (
          { context, event }: { context: ToastMachineContext; event: ToastEvent; }
        ) =>
          event.type === 'REMOVE'
            ? context.toasts.filter((t) => t.id !== event.id)
            : context.toasts,
      }),
    },
  },
});

export const ToastsContext = createActorContext(toastMachine);

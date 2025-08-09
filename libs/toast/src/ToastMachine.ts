import { Toast } from '@eventuras/ratio-ui/core/Toast';
import { createActorContext } from '@xstate/react';
import { assign, setup } from 'xstate';

type ToastMachineContext = {
  toasts: Toast[];
};

interface AddToastEvent {
  type: 'ADD';
  toast: Toast;
}

interface RemoveToastEvent {
  type: 'REMOVE';
  id: string;
}

type ToastEvent = AddToastEvent | RemoveToastEvent;

export const toastMachine = setup({
  types: {
    context: {} as ToastMachineContext,
    events: {} as ToastEvent,
  },
  actions: {
    scheduleRemoval: ({ event, self }) => {
      if (event.type !== 'ADD') return;

      // 10 seconds default
      const expiresAfter = event.toast.expiresAfter ?? 10000;

      setTimeout(() => {
        self.send({ type: 'REMOVE', id: event.toast.id });
      }, expiresAfter);
    },
  },
}).createMachine({
  context: { toasts: [] },
  id: 'toastMachine',
  on: {
    ADD: {
      actions: [
        assign({
          toasts: ({ context, event }) =>
            event.type === 'ADD'
              ? [
                ...context.toasts,
                {
                  ...event.toast,
                  expiresAfter: event.toast.expiresAfter ?? 10000,
                },
              ]
              : context.toasts,
        }),
        'scheduleRemoval',
      ],
    },
    REMOVE: {
      actions: assign({
        toasts: ({ context, event }) =>
          event.type === 'REMOVE'
            ? context.toasts.filter(toast => toast.id !== event.id)
            : context.toasts,
      }),
    },
  },
});

export const ToastsContext = createActorContext(toastMachine);

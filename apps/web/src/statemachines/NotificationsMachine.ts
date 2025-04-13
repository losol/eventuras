// notificationsMachine.ts
import { AppNotification } from '@eventuras/ui';
import { createActorContext } from '@xstate/react';
import { assign, setup } from 'xstate';

type NotificationMachineContext = {
  notifications: AppNotification[];
};

interface AddNotificationEvent {
  type: 'ADD';
  notification: AppNotification;
}

interface RemoveNotificationEvent {
  type: 'REMOVE';
  id: string;
}

type NotificationEvent = AddNotificationEvent | RemoveNotificationEvent;

export const notificationsMachine = setup({
  types: {
    context: {} as NotificationMachineContext,
    events: {} as NotificationEvent,
  },
  actions: {
    scheduleRemoval: ({ event, self }) => {
      if (event.type !== 'ADD') return;

      const expiresAfter = event.notification.expiresAfter ?? 10000; // 10 seconds default

      setTimeout(() => {
        self.send({ type: 'REMOVE', id: event.notification.id });
      }, expiresAfter);
    },
  },
}).createMachine({
  context: { notifications: [] },
  id: 'notificationsMachine',
  on: {
    ADD: {
      actions: [
        assign({
          notifications: ({ context, event }) =>
            event.type === 'ADD'
              ? [
                  ...context.notifications,
                  {
                    ...event.notification,
                    expiresAfter: event.notification.expiresAfter ?? 10000,
                  },
                ]
              : context.notifications,
        }),
        'scheduleRemoval',
      ],
    },
    REMOVE: {
      actions: assign({
        notifications: ({ context, event }) =>
          event.type === 'REMOVE'
            ? context.notifications.filter(notification => notification.id !== event.id)
            : context.notifications,
      }),
    },
  },
});

export const NotificationsContext = createActorContext(notificationsMachine);

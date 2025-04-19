import { AppNotificationType } from '@eventuras/ratio-ui';
import { v4 as uuidv4 } from 'uuid';

import { NotificationsContext } from '@/statemachines/NotificationsMachine';

export { AppNotificationType } from '@eventuras/ratio-ui';

export interface AppNotification {
  id?: string;
  message: string;
  type?: AppNotificationType;
  expiresAfter?: number;
}

export const useAppNotifications = () => {
  const notificationsActorRef = NotificationsContext.useActorRef();

  const addAppNotification = (notification: AppNotification) => {
    const id = notification.id ?? uuidv4();
    const type = notification.type ?? AppNotificationType.INFO;

    notificationsActorRef.send({
      type: 'ADD',
      notification: { ...notification, id, type },
    });
  };

  return { addAppNotification };
};

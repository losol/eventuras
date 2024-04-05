import { AppNotificationOptions, AppNotificationType } from '@eventuras/ui';
import { useRecoilState } from 'recoil';

import { appNotificationState } from '@/atoms/RecoilState';

export { AppNotificationType } from '@eventuras/ui';

export const useAppNotifications = () => {
  const [appNotifications, setAppNotifications] = useRecoilState(appNotificationState);

  const removeAppNotification = (id: number) => {
    setAppNotifications(appNotifications => appNotifications.filter(n => n.id !== id));
  };

  /**
   * Add a new notification to the notifications list.
   *
   * @param {number} id - Unique identifier for the notification.
   * @param {string} message - The message to display.
   * @param {AppNotificationType} [type=AppNotificationType.INFO] - Type of the notification. Defaults to 'INFO'.
   * @param {number} [expiresAfter=5000] - Time (in milliseconds) after which the notification will expire. Defaults to 5000ms.
   */
  const addAppNotification = (options: AppNotificationOptions) => {
    const { id, message, type = AppNotificationType.INFO, expiresAfter = 5000 } = options;

    const newAppNotification: AppNotificationOptions = {
      id,
      message,
      type,
      expiresAfter,
    };

    setAppNotifications([...appNotifications, newAppNotification]);

    if (expiresAfter !== 0) {
      setTimeout(() => {
        removeAppNotification(id);
      }, expiresAfter);
    }
  };

  return {
    appNotifications,
    addAppNotification,
    removeAppNotification,
  };
};

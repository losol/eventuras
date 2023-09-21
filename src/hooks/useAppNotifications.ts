import { useRecoilState } from 'recoil';

import { appNotificationState } from '@/atoms/RecoilState';
import {
  AppNotificationOptions,
  AppNotificationType,
} from '@/components/feedback/AppNotifications';

export { AppNotificationType } from '@/components/feedback/AppNotifications';

export const useAppNotifications = () => {
  const [appNotifications, setAppNotifications] = useRecoilState(appNotificationState);

  const removeAppNotification = (id: number) => {
    setAppNotifications(appNotifications => appNotifications.filter(n => n.id !== id));
  };

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

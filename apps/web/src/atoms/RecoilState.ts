import { AppNotificationOptions } from '@eventuras/ui/AppNotifications';
import { atom } from 'recoil';

export const appNotificationState = atom<AppNotificationOptions[]>({
  key: 'appNotificationState',
  default: [],
});

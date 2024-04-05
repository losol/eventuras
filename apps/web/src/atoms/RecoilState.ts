import { AppNotificationOptions } from '@eventuras/ui';
import { atom } from 'recoil';

export const appNotificationState = atom<AppNotificationOptions[]>({
  key: 'appNotificationState',
  default: [],
});

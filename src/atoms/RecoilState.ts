import { atom } from 'recoil';

import { AppNotificationOptions } from '@/components/feedback/AppNotifications';

export const appNotificationState = atom<AppNotificationOptions[]>({
  key: 'appNotificationState',
  default: [],
});

import { atom } from 'recoil';

import { AppNotificationOptions } from '@/components/ui/AppNotifications';

export const appNotificationState = atom<AppNotificationOptions[]>({
  key: 'appNotificationState',
  default: [],
});

import AppNotifications from '@eventuras/ui/AppNotifications';
import React from 'react';
import { useRecoilValue } from 'recoil';

import { appNotificationState } from '@/atoms/RecoilState';

const NotificationsProvider: React.FC = () => {
  const appNotifications = useRecoilValue(appNotificationState);

  return <AppNotifications appNotifications={appNotifications} />;
};

export default NotificationsProvider;

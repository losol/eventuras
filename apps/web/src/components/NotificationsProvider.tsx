'use client';

import { AppNotifications } from '@eventuras/ui';
import React from 'react';
import { useRecoilValue } from 'recoil';

import { appNotificationState } from '@/atoms/RecoilState';

const NotificationsProvider: React.FC = () => {
  const appNotifications = useRecoilValue(appNotificationState);

  return <AppNotifications appNotifications={appNotifications} />;
};

export default NotificationsProvider;

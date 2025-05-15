'use client';

import { AppNotifications } from '@eventuras/ratio-ui';
import React from 'react';

import { NotificationsContext } from '@/statemachines/NotificationsMachine';

const NotificationsProvider: React.FC = () => {
  const appNotifications = NotificationsContext.useSelector(state => state.context.notifications);

  return <AppNotifications appNotifications={appNotifications} />;
};

export default NotificationsProvider;

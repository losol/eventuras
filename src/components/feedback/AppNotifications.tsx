import React from 'react';

import { Portal } from '@/components/layout';

export enum AppNotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
}

export interface AppNotificationOptions {
  id: number;
  message: string;
  type?: AppNotificationType;
  expiresAfter?: number;
}

interface AppNotificationsProps {
  appNotifications?: AppNotificationOptions[];
}

const AppNotifications: React.FC<AppNotificationsProps> = ({
  appNotifications = [], // defaults to empty array
}) => {
  return (
    <div>
      <Portal isOpen={appNotifications.length > 0}>
        <div className="fixed bottom-0 right-0 z-50 p-4">
          {appNotifications.map(appNotification => (
            <div
              key={appNotification.id}
              className={`m-2 p-4 rounded shadow-lg 
                            ${
                              appNotification.type === 'success'
                                ? 'bg-green-500 text-white'
                                : appNotification.type === 'error'
                                ? 'bg-red-500 text-white'
                                : 'bg-blue-500 text-white'
                            }`}
            >
              {appNotification.message}
            </div>
          ))}
        </div>
      </Portal>
    </div>
  );
};

export default AppNotifications;

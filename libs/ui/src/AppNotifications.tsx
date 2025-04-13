import { DATA_TEST_ID } from '@eventuras/utils';
import { Portal } from '.';

export enum AppNotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
}

export interface AppNotification {
  id: string;
  message: string;
  type?: AppNotificationType;
  expiresAfter?: number;
}

interface AppNotificationsProps {
  appNotifications?: AppNotification[];
}

const getNotificationClassName = (type: AppNotificationType) => {
  let colorClass = '';
  switch (type) {
    case AppNotificationType.SUCCESS:
      colorClass = 'bg-green-500 text-white';
      break;
    case AppNotificationType.ERROR:
      colorClass = 'bg-red-500 text-white';
      break;
    default:
      colorClass = 'bg-blue-500 text-white';
  }
  return `m-2 p-4 rounded shadow-lg ${colorClass}`;
};

const AppNotifications: React.FC<AppNotificationsProps> = ({ appNotifications = [] }) => {
  return (
    <div>
      <Portal isOpen={appNotifications.length > 0}>
        <div className="fixed bottom-0 right-0 z-50 p-4">
        {appNotifications
          .filter((notification) => notification != null)
          .map(({ id, message, type = AppNotificationType.INFO }) => (
            <div
              key={id}
              {...{ [DATA_TEST_ID]: (type === AppNotificationType.SUCCESS ? 'notification-success' : 'notification-error') }}
              className={getNotificationClassName(type)}
            >
              {message}
            </div>
          ))}
        </div>
      </Portal>
    </div>
  );
};

export default AppNotifications;

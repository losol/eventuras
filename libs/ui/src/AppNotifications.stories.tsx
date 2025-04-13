import { Meta } from '@storybook/react';
import React, { useState } from 'react';

import AppNotifications, { AppNotification, AppNotificationType } from './AppNotifications';

const meta: Meta = {
  component: AppNotifications,
  // tags: ['autodocs'],
};

export default meta;

const InteractiveWrapper: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = (notification: Omit<AppNotification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    setNotifications([...notifications, newNotification]);

    if (newNotification.expiresAfter) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, newNotification.expiresAfter);
    }
  };

  const buttonStyle = {
    margin: '10px',
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '5px',
  };

  return (
    <div>
      <AppNotifications appNotifications={notifications} />
      <button
        style={buttonStyle}
        onClick={() =>
          addNotification({
            message: 'Hooray! This success message will vanish in 5 seconds.',
            type: AppNotificationType.SUCCESS,
            expiresAfter: 5000,
          })
        }
      >
        Add 5-sec Success Notification
      </button>
      <button
        style={buttonStyle}
        onClick={() =>
          addNotification({
            message: "Oops! Something went wrong. I'm here to stay.",
            type: AppNotificationType.ERROR,
          })
        }
      >
        Add Indefinite Error Notification
      </button>
      <button
        style={buttonStyle}
        onClick={() =>
          addNotification({
            message: "Heads up! I'll disappear in 2 seconds.",
            type: AppNotificationType.INFO,
            expiresAfter: 2000,
          })
        }
      >
        Add 2-sec Info Notification
      </button>
    </div>
  );
};

export const Default = () => <InteractiveWrapper />;

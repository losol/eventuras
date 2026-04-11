import type { CSSProperties } from 'react';
import {
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastRegion as ToastRegion,
  Button,
  Text,
} from 'react-aria-components';

import type { Status } from '../tokens/colors';
import { toastQueue, type ToastContent as ToastContentData } from './toastQueue';
import './Toast.css';

const statusClasses: Record<Status, string> = {
  neutral: 'bg-neutral-700 text-white',
  info: 'bg-info text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  error: 'bg-error text-white',
};

export const ToastRenderer: React.FC = () => {
  return (
    <ToastRegion
      queue={toastQueue}
      className="fixed bottom-0 right-0 z-50 flex flex-col-reverse gap-2 p-4 outline-none"
    >
      {({ toast }) => {
        const { status, message, description } = toast.content as ToastContentData;
        return (
          <Toast
            toast={toast}
            data-testid={`toast-${status}`}
            style={{ viewTransitionName: toast.key } as CSSProperties}
            className={`flex items-center gap-4 m-2 p-4 rounded-xs shadow-lg min-w-[230px] max-w-[400px] outline-none [view-transition-class:toast] ${statusClasses[status]}`}
          >
            <ToastContent className="flex flex-col flex-1 min-w-0">
              <Text slot="title" className="font-semibold text-sm">
                {message}
              </Text>
              {description && (
                <Text slot="description" className="text-xs opacity-90">
                  {description}
                </Text>
              )}
            </ToastContent>
            <Button
              slot="close"
              aria-label="Close"
              className="flex flex-none items-center justify-center w-6 h-6 rounded-sm bg-transparent border-none text-white p-0 outline-none hover:bg-white/10 pressed:bg-white/15 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 cursor-pointer"
            >
              ×
            </Button>
          </Toast>
        );
      }}
    </ToastRegion>
  );
};

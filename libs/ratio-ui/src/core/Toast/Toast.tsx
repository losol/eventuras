import { Portal } from '../../layout/Portal';

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
}

export interface Toast {
  id: string;
  message: string;
  type?: ToastType;
  expiresAfter?: number;
}

interface ToastProps {
  toasts?: Toast[];
}

const getToastClassName = (type: ToastType) => {
  let colorClass = '';
  switch (type) {
    case ToastType.SUCCESS:
      colorClass = 'bg-green-500 text-white';
      break;
    case ToastType.ERROR:
      colorClass = 'bg-red-500 text-white';
      break;
    default:
      colorClass = 'bg-blue-500 text-white';
  }
  return `m-2 p-4 rounded-xs shadow-lg ${colorClass}`;
};

export const Toast: React.FC<ToastProps> = ({ toasts = [] }) => {
  return (
    <div>
      <Portal isOpen={toasts.length > 0}>
        <div className="fixed bottom-0 right-0 z-50 p-4">
        {toasts
          .filter((toast) => toast != null)
          .map(({ id, message, type = ToastType.INFO }) => (
            <div
              key={id}
              data-testid={type === ToastType.SUCCESS ? 'toast-success' : 'toast-error'}
              className={getToastClassName(type)}
            >
              {message}
            </div>
          ))}
        </div>
      </Portal>
    </div>
  );
};


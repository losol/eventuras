import type { Status } from '../../tokens/colors';
import { Portal } from '../../layout/Portal';
import { cn } from '../../utils/cn';

export interface Toast {
  id: string;
  message: string;
  status?: Status;
  expiresAfter?: number;
}

interface ToastProps {
  toasts?: Toast[];
}

const statusClasses: Record<Status, string> = {
  neutral: 'bg-neutral-700 text-white',
  info: 'bg-info text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  error: 'bg-error text-white',
};

export const Toast: React.FC<ToastProps> = ({ toasts = [] }) => {
  return (
    <div>
      <Portal isOpen={toasts.length > 0}>
        <div className="fixed bottom-0 right-0 z-50 p-4">
          {toasts
            .filter((toast) => toast != null)
            .map(({ id, message, status = 'info' }) => (
              <div
                key={id}
                data-testid={`toast-${status}`}
                className={cn('m-2 p-4 rounded-xs shadow-lg', statusClasses[status])}
              >
                {message}
              </div>
            ))}
        </div>
      </Portal>
    </div>
  );
};

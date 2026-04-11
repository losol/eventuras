import type { Status } from '../tokens/colors';

import { toastQueue } from './toastQueue';

export interface ToastOptions {
  description?: string;
  expiresAfter?: number;
}

export interface AddToastArgs extends ToastOptions {
  message: string;
  status?: Status;
}

const addToast = (toast: AddToastArgs) => {
  const { message, status = 'info', description, expiresAfter = 10_000 } = toast;
  return toastQueue.add(
    { message, status, description },
    { timeout: expiresAfter }
  );
};

const withStatus = (status: Status) =>
  (message: string, options?: ToastOptions) =>
    addToast({ status, message, ...options });

export const useToast = () => ({
  success: withStatus('success'),
  error: withStatus('error'),
  warning: withStatus('warning'),
  info: withStatus('info'),
  remove: (key: string) => toastQueue.close(key),
});

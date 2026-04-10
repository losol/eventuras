import type { ToastData } from '@eventuras/ratio-ui/core/Toast';

import { ToastsContext } from './ToastMachine';

export const useToast = () => {
  const toastsActorRef = ToastsContext.useActorRef();

  const addToast = (toast: Omit<ToastData, 'id'> & { id?: string }) => {
    const status = toast.status ?? 'info';

    toastsActorRef.send({
      type: 'ADD',
      toast: { ...toast, status },
    });
  };

  const removeToast = (id: string) => {
    toastsActorRef.send({ type: 'REMOVE', id });
  };

  return Object.assign(addToast, {
    success: (message: string, options?: Partial<Omit<ToastData, 'id' | 'status'>>) =>
      addToast({ status: 'success', message, ...options }),
    error: (message: string, options?: Partial<Omit<ToastData, 'id' | 'status'>>) =>
      addToast({ status: 'error', message, ...options }),
    warning: (message: string, options?: Partial<Omit<ToastData, 'id' | 'status'>>) =>
      addToast({ status: 'warning', message, ...options }),
    info: (message: string, options?: Partial<Omit<ToastData, 'id' | 'status'>>) =>
      addToast({ status: 'info', message, ...options }),
    remove: removeToast,
  });
};

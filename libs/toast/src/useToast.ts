import { Toast, ToastType } from '@eventuras/ratio-ui/core/Toast';

import { ToastsContext } from './ToastMachine';

export const useToast = () => {
  const toastsActorRef = ToastsContext.useActorRef();

  const addToast = (toast: Omit<Toast, 'id'> & { id?: string; }) => {
    const type = toast.type ?? ToastType.INFO;

    toastsActorRef.send({
      type: 'ADD',
      toast: { ...toast, type },
    });

  };

  const removeToast = (id: string) => {
    toastsActorRef.send({ type: 'REMOVE', id });
  };

  return Object.assign(addToast, {
    success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) =>
      addToast({
        type: ToastType.SUCCESS,
        message,
        ...options
      }),
    error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) =>
      addToast({
        type: ToastType.ERROR,
        message,
        ...options
      }),
    info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) =>
      addToast({
        type: ToastType.INFO,
        message,
        ...options
      }),
    remove: removeToast,
  });
};

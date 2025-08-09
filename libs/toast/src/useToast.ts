import { Toast, ToastType } from '@eventuras/ratio-ui/core/Toast';
import { v4 as uuidv4 } from 'uuid';

import { ToastsContext } from './ToastMachine';

export const useToast = () => {
  const toastsActorRef = ToastsContext.useActorRef();

  const addToast = (toast: Toast) => {
    const id = toast.id ?? uuidv4();
    const type = toast.type ?? ToastType.INFO;

    toastsActorRef.send({
      type: 'ADD',
      toast: { ...toast, id, type },
    });

    return id;
  };

  const removeToast = (id: string) => {
    toastsActorRef.send({ type: 'REMOVE', id });
  };

  return Object.assign(addToast, {
    success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) =>
      addToast({
        id: uuidv4(),
        type: ToastType.SUCCESS,
        message,
        ...options
      }),
    error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) =>
      addToast({
        id: uuidv4(),
        type: ToastType.ERROR,
        message,
        ...options
      }),
    info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) =>
      addToast({
        id: uuidv4(),
        type: ToastType.INFO,
        message,
        ...options
      }),
    remove: removeToast,
  });
};

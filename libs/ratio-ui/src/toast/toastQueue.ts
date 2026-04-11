import { UNSTABLE_ToastQueue as ToastQueue } from 'react-aria-components';
import { flushSync } from 'react-dom';

import type { Status } from '../tokens/colors';

export interface ToastContent {
  message: string;
  status: Status;
  description?: string;
}

export const toastQueue = new ToastQueue<ToastContent>({
  maxVisibleToasts: 5,
  wrapUpdate(fn) {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      document.startViewTransition(() => {
        flushSync(fn);
      });
    } else {
      fn();
    }
  },
});

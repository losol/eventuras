import { UNSTABLE_ToastQueue as ToastQueue } from 'react-aria-components';

import type { Status } from '../tokens/colors';

export interface ToastContent {
  message: string;
  status: Status;
  description?: string;
}

export const toastQueue = new ToastQueue<ToastContent>({
  maxVisibleToasts: 5,
});

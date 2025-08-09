'use client';

import React from 'react';
import { Toast } from '@eventuras/ratio-ui/core/Toast';
import { ToastsContext } from './ToastMachine';

export const ToastRenderer: React.FC = () => {
  const toasts = ToastsContext.useSelector(state => state.context.toasts);

  return <Toast toasts={toasts} />;
};


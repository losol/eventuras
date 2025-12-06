'use client';

import { ToastRenderer, ToastsContext } from '@eventuras/toast';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastsContext.Provider>
      <ToastRenderer />
      {children}
    </ToastsContext.Provider>
  );
}

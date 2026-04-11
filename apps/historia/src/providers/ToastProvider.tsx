'use client';

import { ToastRenderer } from '@eventuras/ratio-ui/toast';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToastRenderer />
      {children}
    </>
  );
}

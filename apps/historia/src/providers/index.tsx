import React from 'react';

import { CartProvider } from '@/lib/cart';

import { HeaderThemeProvider } from './HeaderTheme';
import { ThemeProvider } from './Theme';
import { ToastProvider } from './ToastProvider';

export const Providers: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  );
};

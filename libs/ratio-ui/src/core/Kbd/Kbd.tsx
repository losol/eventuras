import React from 'react';

export interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Keyboard shortcut indicator.
 *
 * Renders an inline `<kbd>` element styled as a small key cap.
 */
export function Kbd({ children, className = '' }: Readonly<KbdProps>) {
  return (
    <kbd
      className={`inline-flex items-center justify-center rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-xs font-sans text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 ${className}`}
    >
      {children}
    </kbd>
  );
}

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
      className={`inline-flex items-center justify-center rounded border border-border-1 bg-card px-1.5 py-0.5 text-xs font-sans text-(--text-subtle) ${className}`}
    >
      {children}
    </kbd>
  );
}

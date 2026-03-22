import { FC, ReactNode } from 'react';

export interface ActionBarProps {
  children: ReactNode;
  className?: string;
}

/**
 * Action bar for grouping page-level actions (save, preview, etc.)
 */
const ActionBarBase: FC<ActionBarProps> = ({ children, className = '' }) => (
  <div
    className={`flex items-center gap-2 rounded-md bg-black/5 px-4 py-3 dark:bg-white/5 ${className}`}
  >
    {children}
  </div>
);

/**
 * Pushes subsequent children to the right side of the ActionBar
 */
const Spacer = () => <div className="flex-1" />;

export const ActionBar = Object.assign(ActionBarBase, { Spacer });

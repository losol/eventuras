import React, { ReactNode } from 'react';
import './Panel.css';

export type PanelVariant = 'alert' | 'callout' | 'notice';
export type PanelIntent = 'info' | 'success' | 'warning' | 'error' | 'neutral';

export interface PanelProps {
  children: ReactNode;
  variant?: PanelVariant;
  intent?: PanelIntent;
  className?: string;
}

/**
 * Panel component - A versatile container for displaying alerts, callouts, notices, and more
 *
 * @example
 * ```tsx
 * // Alert panel (with colored border)
 * <Panel variant="alert" intent="info">
 *   Your session will expire in 5 minutes
 * </Panel>
 *
 * <Panel variant="alert" intent="error">
 *   Invalid credentials. Please try again.
 * </Panel>
 *
 * // Callout panel (subtle, for emphasis)
 * <Panel variant="callout" intent="info">
 *   <strong>Pro tip:</strong> Use keyboard shortcuts to navigate faster
 * </Panel>
 *
 * // Notice panel (for announcements)
 * <Panel variant="notice" intent="warning">
 *   System maintenance scheduled for tonight at 2 AM
 * </Panel>
 * ```
 */
export const Panel: React.FC<PanelProps> = ({
  children,
  variant = 'alert',
  intent = 'info',
  className = '',
}) => {
  const classes = [
    'panel',
    `panel--${variant}`,
    `panel--${intent}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} role={variant === 'alert' ? 'alert' : undefined}>
      {children}
    </div>
  );
};

export default Panel;

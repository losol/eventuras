/**
 * Shared color and status types
 */

/** Full semantic color palette */
export type Color =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

/** Status subset — for components that signal state (Panel, Badge, etc.) */
export type Status = 'neutral' | 'success' | 'warning' | 'error' | 'info';

/** Background color classes for surface components (Section, Card, etc.) */
export const surfaceBgClasses: Record<Color, string> = {
  neutral: 'bg-neutral-50 dark:bg-neutral-900',
  primary: 'bg-primary-50 dark:bg-primary-950',
  secondary: 'bg-secondary-50 dark:bg-secondary-950',
  accent: 'bg-accent-50 dark:bg-accent-950',
  success: 'bg-success-bg',
  warning: 'bg-warning-bg',
  error: 'bg-error-bg',
  info: 'bg-info-bg',
};

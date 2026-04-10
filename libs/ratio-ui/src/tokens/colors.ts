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

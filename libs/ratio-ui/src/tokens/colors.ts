/**
 * Shared color and status types
 * @see docs/adr/0001-spacing-borders-colors.md
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

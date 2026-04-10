/**
 * Shared design-system types for ratio-ui 1.0
 * @see docs/adr/0001-spacing-borders-colors.md
 */

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

/** 6-step semantic spacing scale backed by fluid CSS tokens */
export type Space = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SpacingProps {
  padding?: Space;
  paddingX?: Space;
  paddingY?: Space;
  margin?: Space;
  marginX?: Space;
  marginY?: Space;
  gap?: Space;
}

// ---------------------------------------------------------------------------
// Borders
// ---------------------------------------------------------------------------

export type BorderVariant = 'default' | 'strong' | 'subtle';

export interface BorderProps {
  border?: boolean | BorderVariant;
  borderColor?: 'default' | 'subtle' | 'strong' | Color;
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

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

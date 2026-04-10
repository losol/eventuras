/**
 * Shared spacing tokens for consistent gaps across components
 */
export const gridGapClasses = {
  '4': 'gap-x-4 gap-y-2 md:gap-x-4 md:gap-y-4',
  '6': 'gap-x-6 gap-y-3 md:gap-x-6 md:gap-y-6',
  '8': 'gap-x-8 gap-y-4 md:gap-x-8 md:gap-y-8',
} as const;

export type GapSize = keyof typeof gridGapClasses;

/**
 * Generate grid classes for 2-column responsive layout
 * @param gap - The gap size using Tailwind spacing scale
 * @returns Tailwind grid classes
 */
export const getGridClasses = (gap: GapSize = '6'): string => {
  return `grid grid-cols-1 md:grid-cols-2 ${gridGapClasses[gap]}`;
};

// ---------------------------------------------------------------------------
// ADR-0001: Semantic spacing scale
// ---------------------------------------------------------------------------

/** 6-step semantic spacing scale backed by fluid CSS tokens */
export type Space = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SpacingProps {
  padding?: Space;
  paddingX?: Space;
  paddingY?: Space;
  paddingTop?: Space;
  paddingBottom?: Space;
  margin?: Space;
  marginX?: Space;
  marginY?: Space;
  marginTop?: Space;
  marginBottom?: Space;
  gap?: Space;
}

/** Maps a Space token to the Tailwind suffix (matches --spacing-* keys) */
const spaceValue: Record<Space, string> = {
  none: '0',
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
};

export function buildSpacingClasses(props: SpacingProps): string {
  const classes: string[] = [];

  if (props.padding) classes.push(`p-${spaceValue[props.padding]}`);
  if (props.paddingX) classes.push(`px-${spaceValue[props.paddingX]}`);
  if (props.paddingY) classes.push(`py-${spaceValue[props.paddingY]}`);
  if (props.paddingTop) classes.push(`pt-${spaceValue[props.paddingTop]}`);
  if (props.paddingBottom) classes.push(`pb-${spaceValue[props.paddingBottom]}`);
  if (props.margin) classes.push(`m-${spaceValue[props.margin]}`);
  if (props.marginX) classes.push(`mx-${spaceValue[props.marginX]}`);
  if (props.marginY) classes.push(`my-${spaceValue[props.marginY]}`);
  if (props.marginTop) classes.push(`mt-${spaceValue[props.marginTop]}`);
  if (props.marginBottom) classes.push(`mb-${spaceValue[props.marginBottom]}`);
  if (props.gap) classes.push(`gap-${spaceValue[props.gap]}`);

  return classes.join(' ');
}

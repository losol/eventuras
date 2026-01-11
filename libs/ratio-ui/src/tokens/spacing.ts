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

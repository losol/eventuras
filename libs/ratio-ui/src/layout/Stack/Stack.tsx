import React from 'react';

export interface StackProps {
  /**
   * Direction of the stack
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal';
  /**
   * Spacing between items
   * @default 'md'
   */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /**
   * Alignment of items along the cross axis
   */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /**
   * Justify content along the main axis
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /**
   * Whether items should wrap
   * @default false
   */
  wrap?: boolean;
  /**
   * Show dividers between items
   * @default false
   */
  dividers?: boolean;
  /**
   * Custom className
   */
  className?: string;
  /**
   * HTML element to render
   * @default 'div'
   */
  as?: 'div' | 'section' | 'article' | 'aside' | 'nav' | 'ul' | 'ol';
  /**
   * Child elements
   */
  children: React.ReactNode;
}

const gapClasses = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
};

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

/**
 * Stack - A flexible container for arranging items in a row or column with consistent spacing
 *
 * @example
 * ```tsx
 * // Vertical stack with medium gap
 * <Stack gap="md">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Stack>
 *
 * // Horizontal stack with dividers
 * <Stack direction="horizontal" gap="lg" dividers>
 *   <span>Section 1</span>
 *   <span>Section 2</span>
 *   <span>Section 3</span>
 * </Stack>
 *
 * // Centered items
 * <Stack align="center" justify="center">
 *   <button>Action 1</button>
 *   <button>Action 2</button>
 * </Stack>
 * ```
 */
export const Stack: React.FC<StackProps> = ({
  direction = 'vertical',
  gap = 'md',
  align,
  justify,
  wrap = false,
  dividers = false,
  className = '',
  as: Component = 'div',
  children,
}) => {
  const flexDirection = direction === 'vertical' ? 'flex-col' : 'flex-row';
  const gapClass = gapClasses[gap];
  const alignClass = align ? alignClasses[align] : '';
  const justifyClass = justify ? justifyClasses[justify] : '';
  const wrapClass = wrap ? 'flex-wrap' : '';
  const dividerClass = dividers
    ? direction === 'vertical'
      ? 'divide-y divide-gray-200 dark:divide-gray-700'
      : 'divide-x divide-gray-200 dark:divide-gray-700'
    : '';

  const classes = [
    'flex',
    flexDirection,
    gapClass,
    alignClass,
    justifyClass,
    wrapClass,
    dividerClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Component className={classes}>{children}</Component>;
};

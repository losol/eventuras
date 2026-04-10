import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses, extractSpacingProps } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface StoryFooterProps
  extends SpacingProps,
    Omit<React.ComponentPropsWithoutRef<'footer'>, keyof SpacingProps> {}

export function StoryFooter(props: StoryFooterProps) {
  const [spacing, { className, children, ...rest }] = extractSpacingProps(props);
  const { gap = 'xs', ...otherSpacing } = spacing;

  return (
    <footer
      className={cn('story-footer', buildSpacingClasses({ ...otherSpacing, gap }), className)}
      {...rest}
    >
      {children}
    </footer>
  );
}

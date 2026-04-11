import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses, extractSpacingProps } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface StoryFooterProps
  extends SpacingProps,
    Omit<React.ComponentPropsWithoutRef<'footer'>, keyof SpacingProps> {
  testId?: string;
}

export function StoryFooter(props: Readonly<StoryFooterProps>) {
  const [spacing, { className, children, testId, ...rest }] = extractSpacingProps(props);
  const { gap = 'xs', ...otherSpacing } = spacing;

  return (
    <footer
      className={cn('story-footer', buildSpacingClasses({ ...otherSpacing, gap }), className)}
      data-testid={testId}
      {...rest}
    >
      {children}
    </footer>
  );
}

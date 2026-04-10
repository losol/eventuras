import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses, extractSpacingProps } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface StoryBodyProps
  extends SpacingProps,
    Omit<React.ComponentPropsWithoutRef<'section'>, keyof SpacingProps> {
  testId?: string;
}

export function StoryBody(props: StoryBodyProps) {
  const [spacing, { className, children, testId, ...rest }] = extractSpacingProps(props);
  const { gap = 'sm', ...otherSpacing } = spacing;

  return (
    <section
      className={cn('story-body', buildSpacingClasses({ ...otherSpacing, gap }), className)}
      data-testid={testId}
      {...rest}
    >
      {children}
    </section>
  );
}

import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses, extractSpacingProps } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface StoryHeaderProps
  extends SpacingProps,
    Omit<React.ComponentPropsWithoutRef<'header'>, keyof SpacingProps> {
  testId?: string;
}

export function StoryHeader(props: StoryHeaderProps) {
  const [spacing, { className, children, testId, ...rest }] = extractSpacingProps(props);
  const { paddingY = 'xs', marginBottom = 'sm', gap = 'sm', ...otherSpacing } = spacing;

  return (
    <header
      className={cn('story-header', buildSpacingClasses({ ...otherSpacing, paddingY, marginBottom, gap }), className)}
      data-testid={testId}
      {...rest}
    >
      {children}
    </header>
  );
}

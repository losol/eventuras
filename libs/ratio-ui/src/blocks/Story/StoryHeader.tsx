import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses, extractSpacingProps } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface StoryHeaderProps
  extends SpacingProps,
    Omit<React.ComponentPropsWithoutRef<'header'>, keyof SpacingProps> {}

export function StoryHeader(props: StoryHeaderProps) {
  const [spacing, { className, children, ...rest }] = extractSpacingProps(props);
  const { paddingY = 'xs', marginBottom = 'sm', gap = 'sm', ...otherSpacing } = spacing;

  return (
    <header
      className={cn('story-header', buildSpacingClasses({ ...otherSpacing, paddingY, marginBottom, gap }), className)}
      {...rest}
    >
      {children}
    </header>
  );
}

import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface StoryBodyProps extends SpacingProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function StoryBody({
  children,
  className,
  gap = 'sm',
  style,
  ...spacingProps
}: StoryBodyProps) {
  return (
    <section
      className={cn('story-body', buildSpacingClasses({ ...spacingProps, gap }), className)}
      style={style}
    >
      {children}
    </section>
  );
}

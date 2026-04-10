import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface StoryFooterProps extends SpacingProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function StoryFooter({
  children,
  className,
  gap = 'xs',
  style,
  ...spacingProps
}: StoryFooterProps) {
  return (
    <footer
      className={cn('story-footer', buildSpacingClasses({ ...spacingProps, gap }), className)}
      style={style}
    >
      {children}
    </footer>
  );
}

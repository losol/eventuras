import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface StoryHeaderProps extends SpacingProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function StoryHeader({
  children,
  className,
  paddingY = 'xs',
  marginBottom = 'sm',
  gap = 'sm',
  style,
  ...spacingProps
}: StoryHeaderProps) {
  return (
    <header
      className={cn('story-header', buildSpacingClasses({ ...spacingProps, paddingY, marginBottom, gap }), className)}
      style={style}
    >
      {children}
    </header>
  );
}

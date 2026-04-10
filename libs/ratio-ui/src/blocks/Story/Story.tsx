import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface StoryProps extends SpacingProps {
  children: React.ReactNode;
  as?: 'div' | 'article' | 'section';
  className?: string;
  style?: React.CSSProperties;
}

export function Story({
  children,
  className,
  as: Component = 'div',
  style,
  ...spacingProps
}: StoryProps) {
  return (
    <Component className={cn('story', buildSpacingClasses(spacingProps), className)} style={style}>
      {children}
    </Component>
  );
}

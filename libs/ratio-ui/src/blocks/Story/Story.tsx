import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses, extractSpacingProps } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface StoryProps
  extends SpacingProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof SpacingProps> {
  as?: 'div' | 'article' | 'section';
}

export function Story(props: StoryProps) {
  const [spacingProps, { as: Component = 'div', className, children, ...rest }] =
    extractSpacingProps(props);

  return (
    <Component className={cn('story', buildSpacingClasses(spacingProps), className)} {...rest}>
      {children}
    </Component>
  );
}

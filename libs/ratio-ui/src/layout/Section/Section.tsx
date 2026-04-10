import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import type { Color } from '../../tokens/colors';
import { surfaceBgClasses } from '../../tokens/colors';
import { buildSpacingClasses, extractSpacingProps } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface SectionProps
  extends SpacingProps,
    Omit<React.ComponentPropsWithoutRef<'section'>, keyof SpacingProps | 'color'> {
  color?: Color;
  testId?: string;
}

export const Section: React.FC<SectionProps> = (props) => {
  const [spacing, {
    color,
    className,
    children,
    testId,
    ...rest
  }] = extractSpacingProps(props);

  return (
    <section
      className={cn(
        buildSpacingClasses(spacing),
        color && surfaceBgClasses[color],
        className,
      )}
      data-testid={testId}
      {...rest}
    >
      {children}
    </section>
  );
};

Section.displayName = 'Section';

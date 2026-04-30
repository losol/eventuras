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
  /**
   * Marks the section as a dark surface so descendants (Heading, Button,
   * Link) pick up light `var(--text)` color. Use for hero sections with
   * dark or strongly colored backgrounds. For the rare case of forcing a
   * light surface inside a dark page, apply `className="surface-light"`.
   */
  dark?: boolean;
  testId?: string;
}

export const Section: React.FC<SectionProps> = (props) => {
  const [spacing, {
    color,
    dark,
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
        dark && 'surface-dark',
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

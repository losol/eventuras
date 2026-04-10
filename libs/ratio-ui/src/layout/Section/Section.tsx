import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import type { Color } from '../../tokens/colors';
import { surfaceBgClasses } from '../../tokens/colors';
import { buildSpacingClasses, extractSpacingProps } from '../../tokens/spacing';
import { buildCoverImageStyle } from '../../utils/buildCoverImageStyle';
import { cn } from '../../utils/cn';

export interface SectionProps
  extends SpacingProps,
    Omit<React.ComponentPropsWithoutRef<'section'>, keyof SpacingProps | 'color'> {
  color?: Color;
  backgroundImageUrl?: string;
  backgroundImageOverlay?: boolean;
}

export const Section: React.FC<SectionProps> = (props) => {
  const [spacing, {
    color,
    backgroundImageUrl,
    backgroundImageOverlay = false,
    className,
    style,
    children,
    ...rest
  }] = extractSpacingProps(props);

  const coverStyle = buildCoverImageStyle(backgroundImageUrl, style, backgroundImageOverlay);

  return (
    <section
      className={cn(
        buildSpacingClasses(spacing),
        color && surfaceBgClasses[color],
        className,
      )}
      style={coverStyle}
      {...rest}
    >
      {children}
    </section>
  );
};

Section.displayName = 'Section';

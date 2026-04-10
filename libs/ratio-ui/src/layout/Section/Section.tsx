import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses, extractSpacingProps } from '../../tokens/spacing';
import { buildCoverImageStyle } from '../../utils/buildCoverImageStyle';
import { cn } from '../../utils/cn';

export interface SectionProps
  extends SpacingProps,
    Omit<React.ComponentPropsWithoutRef<'section'>, keyof SpacingProps> {
  backgroundColorClass?: string;
  backgroundImageUrl?: string;
  backgroundImageOverlay?: boolean;
}

export const Section: React.FC<SectionProps> = (props) => {
  const [spacing, {
    backgroundColorClass,
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
        backgroundColorClass,
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

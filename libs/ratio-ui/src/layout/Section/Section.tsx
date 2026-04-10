import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses } from '../../tokens/spacing';
import { buildCoverImageStyle } from '../../utils/buildCoverImageStyle';
import Container from '../Container/Container';
import { cn } from '../../utils/cn';

export interface SectionProps extends SpacingProps {
  className?: string;
  children?: React.ReactNode;
  /** @deprecated Use Container component inside Section instead */
  container?: boolean;
  backgroundColorClass?: string;
  backgroundImageUrl?: string;
  backgroundImageOverlay?: boolean;
  [key: string]: any;
}

export const Section: React.FC<SectionProps> = ({
  children,
  className,
  container = false,
  backgroundColorClass,
  backgroundImageUrl,
  backgroundImageOverlay = false,
  ...spacingAndRest
}) => {
  // Separate SpacingProps keys from rest HTML attrs
  const {
    padding, paddingX, paddingY, paddingTop, paddingBottom,
    margin, marginX, marginY, marginTop, marginBottom,
    gap,
    ...rest
  } = spacingAndRest;

  const spacingClasses = buildSpacingClasses({
    padding, paddingX, paddingY, paddingTop, paddingBottom,
    margin, marginX, marginY, marginTop, marginBottom,
    gap,
  });
  const style = buildCoverImageStyle(backgroundImageUrl, undefined, backgroundImageOverlay);

  return (
    <section
      className={cn(spacingClasses, backgroundColorClass, className)}
      style={style}
      {...rest}
    >
      {container ? <Container>{children}</Container> : children}
    </section>
  );
};

Section.displayName = 'Section';
export default Section;

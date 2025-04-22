import React from 'react';
import {
  BoxSpacingProps,
  BoxBackgroundProps,
  buildSpacingClasses,
  getBackgroundStyle,
} from '../Box/Box';
import Container from '../Container/Container';

export interface SectionProps
  extends BoxSpacingProps,
          BoxBackgroundProps {
  container?: boolean;
  className?: string;
  /** Any other <section> attrs (e.g. id) */
  [key: string]: any;
}

const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  // spacing props
  padding,
  margin,
  border,
  width,
  height,
  // background props
  bgColorClass,
  backgroundImageUrl,
  // section‑specific
  container = false,
  ...rest
}) => {

  const spacingClasses = buildSpacingClasses({ padding, margin, border, width, height });
  const style = getBackgroundStyle(backgroundImageUrl, undefined);

  const classes = [spacingClasses, bgColorClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      className={classes}
      style={style}
      {...rest}
    >
      {container ? <Container>{children}</Container> : children}
    </section>
  );
};

Section.displayName = 'Section';
export default Section;

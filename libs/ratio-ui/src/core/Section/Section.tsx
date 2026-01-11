import React from 'react';
import { Box, BoxProps } from '../../layout/Box/Box';
import Container from '../../layout/Container/Container';
import { getGridClasses } from '../../tokens';

// Section-specific props that should not be passed to Box
interface SectionSpecificProps {
  container?: boolean;
  grid?: boolean;
}

export interface SectionProps extends BoxProps, SectionSpecificProps {}

const Section: React.FC<SectionProps> = ({
  container = true,
  grid = false,
  gap = '6',
  children,
  className,
  ...boxProps
}) => {
  const gridClasses = grid ? getGridClasses(gap as '4' | '6' | '8') : '';

  // Build clean BoxProps without Section-specific properties
  const cleanBoxProps: BoxProps = {
    as: boxProps.as ?? 'section',
    padding: boxProps.padding,
    margin: boxProps.margin,
    border: boxProps.border,
    width: boxProps.width,
    height: boxProps.height,
    gap,
    backgroundColorClass: boxProps.backgroundColorClass,
    backgroundImageUrl: boxProps.backgroundImageUrl,
    id: boxProps.id,
    style: boxProps.style,
  };

  // When using grid, apply grid classes to the container itself, not the wrapper
  if (grid && container) {
    const combinedClassName = [gridClasses, className].filter(Boolean).join(' ');
    return (
      <Box {...cleanBoxProps}>
        <Container className={combinedClassName}>{children}</Container>
      </Box>
    );
  }

  const combinedClassName = [gridClasses, className].filter(Boolean).join(' ');
  return (
    <Box {...cleanBoxProps} className={combinedClassName}>
      {container ? <Container>{children}</Container> : children}
    </Box>
  );
};

Section.displayName = 'Section';
export default Section;

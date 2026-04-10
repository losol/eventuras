import React from 'react';
import { Box } from '../../layout/Box/Box';
import type { BoxProps } from '../../layout/Box/Box';
import Container from '../../layout/Container/Container';
import { getGridClasses } from '../../tokens';

interface SectionSpecificProps {
  container?: boolean;
  grid?: boolean;
}

export interface SectionProps extends BoxProps, SectionSpecificProps {}

const Section: React.FC<SectionProps> = ({
  container = true,
  grid = false,
  gap = 'sm',
  children,
  className,
  ...boxProps
}) => {
  const gridClasses = grid ? getGridClasses('6') : '';

  const combinedClassName = [gridClasses, className].filter(Boolean).join(' ');

  if (grid && container) {
    return (
      <Box as={boxProps.as ?? 'section'} {...boxProps}>
        <Container className={combinedClassName}>{children}</Container>
      </Box>
    );
  }

  return (
    <Box as={boxProps.as ?? 'section'} {...boxProps} gap={gap} className={combinedClassName}>
      {container ? <Container>{children}</Container> : children}
    </Box>
  );
};

Section.displayName = 'Section';
export default Section;

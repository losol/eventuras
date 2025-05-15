import React from 'react';
import { Box, BoxProps } from '../../layout/Box/Box';
import Container from '../../layout/Container/Container';

export interface SectionProps extends BoxProps {
  /** Wrap content in a fixed‑width container */
  container?: boolean;
}

const Section: React.FC<SectionProps> = ({
  container = true,
  children,
  ...boxProps
}) => (
  <Box {...boxProps} as={boxProps.as ?? 'section'}>
    {container ? <Container>{children}</Container> : children}
  </Box>
);

Section.displayName = 'Section';
export default Section;

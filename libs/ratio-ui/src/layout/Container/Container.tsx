import React from 'react';
import { Box, BoxProps } from '../Box/Box';

export type ContainerProps = Omit<BoxProps, 'as'>;

const Container: React.FC<ContainerProps> = ({
  className = 'container',
  margin = 'mx-auto',
  padding = 'pb-18',
  ...rest
}) => {
  return (
    <Box
      as="div"
      className={`container ${className}`}
      margin={margin}
      padding={padding}
      {...rest}
    />
  );
};

Container.displayName = 'Container';

export default Container;

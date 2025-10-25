import React from 'react';
import { Box, BoxProps } from '../Box/Box';

export type ContainerProps = Omit<BoxProps, 'as'>;

const Container: React.FC<ContainerProps> = ({
  className = '',
  margin = 'mx-auto',
  padding = 'px-3 py-3 pb-18',
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

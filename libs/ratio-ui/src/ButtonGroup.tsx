import React from 'react';

import { BoxProps, spacingClassName } from './Box';

interface ButtonGroupProps {
  children: React.ReactNode;
}

const ButtonGroup: React.FC<ButtonGroupProps & BoxProps> = ({ children, ...spacingProps }) => {
  const baseClassName = 'inline-flex rounded-md shadow-2xs';
  const className = [baseClassName, spacingClassName(spacingProps)].join(' ');

  return (
    <div className={className} role="group">
      {children}
    </div>
  );
};

export default ButtonGroup;

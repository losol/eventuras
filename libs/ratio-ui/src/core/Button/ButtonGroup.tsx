import React from 'react';

import { BoxProps, BoxSpacingProps, buildSpacingClasses } from '../../layout/Box/Box';

export interface ButtonGroupProps extends BoxSpacingProps {
  children: React.ReactNode;
}

const ButtonGroup: React.FC<ButtonGroupProps & BoxProps> = ({ children, ...spacingProps }) => {
  const baseClassName = 'inline-flex';
  const className = [baseClassName, buildSpacingClasses(spacingProps)].join(' ');

  return (
    <div className={className} role="group">
      {children}
    </div>
  );
};

export default ButtonGroup;

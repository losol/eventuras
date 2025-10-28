import React from 'react';

import {
  BoxProps,
  BoxSpacingProps,
  BoxContentProps,
  BoxBackgroundProps,
  buildSpacingClasses,
} from '../../layout/Box/Box';

export interface ButtonGroupProps {
  children: React.ReactNode;
  /**
   * Whether buttons should wrap to multiple lines when space is limited
   * @default false
   */
  wrap?: boolean;
}

const ButtonGroup: React.FC<
  ButtonGroupProps & BoxSpacingProps & BoxContentProps & BoxBackgroundProps
> = ({ children, wrap = false, gap = '2', className: additionalClassName, ...spacingProps }) => {
  const baseClassName = wrap ? 'flex' : 'inline-flex';
  const wrapClassName = wrap ? 'flex-wrap' : '';
  const className = [
    baseClassName,
    wrapClassName,
    buildSpacingClasses({ ...spacingProps, gap }),
    additionalClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} role="group">
      {children}
    </div>
  );
};

export default ButtonGroup;

import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface ButtonGroupProps extends SpacingProps {
  children: React.ReactNode;
  /**
   * Whether buttons should wrap to multiple lines when space is limited
   * @default false
   */
  wrap?: boolean;
  className?: string;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  wrap = false,
  gap = 'xs',
  className,
  ...spacingProps
}) => {
  return (
    <div
      className={cn(
        wrap ? 'flex flex-wrap' : 'inline-flex',
        buildSpacingClasses({ ...spacingProps, gap }),
        className,
      )}
      role="group"
    >
      {children}
    </div>
  );
};

export default ButtonGroup;

import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface ContainerProps extends SpacingProps {
  className?: string;
  children?: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({
  className,
  children,
  ...spacingProps
}) => {
  return (
    <div className={cn('container mx-auto px-3 pb-18', buildSpacingClasses(spacingProps), className)}>
      {children}
    </div>
  );
};

Container.displayName = 'Container';

export default Container;

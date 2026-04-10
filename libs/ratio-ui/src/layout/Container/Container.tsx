import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses, extractSpacingProps } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface ContainerProps
  extends SpacingProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof SpacingProps> {
  testId?: string;
}

export const Container: React.FC<ContainerProps> = (props) => {
  const [spacingProps, { className, children, testId, ...rest }] = extractSpacingProps(props);

  return (
    <div
      className={cn('container mx-auto px-3 pb-18', buildSpacingClasses(spacingProps), className)}
      data-testid={testId}
      {...rest}
    >
      {children}
    </div>
  );
};

Container.displayName = 'Container';

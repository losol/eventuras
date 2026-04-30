import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses, extractSpacingProps } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface ContainerProps
  extends SpacingProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof SpacingProps> {
  /**
   * Marks the container as a dark surface so descendants pick up light
   * `var(--text)` color. Useful when a Container is used standalone
   * (without a Section) on a colored background.
   */
  dark?: boolean;
  testId?: string;
}

export const Container: React.FC<ContainerProps> = (props) => {
  const [spacingProps, { dark, className, children, testId, ...rest }] = extractSpacingProps(props);

  return (
    <div
      className={cn(
        'container mx-auto px-3 pb-18',
        buildSpacingClasses(spacingProps),
        dark && 'surface-dark',
        className,
      )}
      data-testid={testId}
      {...rest}
    >
      {children}
    </div>
  );
};

Container.displayName = 'Container';

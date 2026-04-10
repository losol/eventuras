import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses, extractSpacingProps } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface ButtonGroupProps
  extends SpacingProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof SpacingProps> {
  /**
   * Whether buttons should wrap to multiple lines when space is limited
   * @default false
   */
  wrap?: boolean;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = (props) => {
  const [spacing, { wrap = false, className, children, ...rest }] = extractSpacingProps(props);
  const { gap = 'xs', ...otherSpacing } = spacing;

  return (
    <div
      className={cn(
        wrap ? 'flex flex-wrap' : 'inline-flex',
        buildSpacingClasses({ ...otherSpacing, gap }),
        className,
      )}
      role="group"
      {...rest}
    >
      {children}
    </div>
  );
};

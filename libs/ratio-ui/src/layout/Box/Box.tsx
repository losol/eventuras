import React, { ReactNode, ElementType, CSSProperties } from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import type { BorderProps } from '../../tokens/borders';
import { buildSpacingClasses } from '../../tokens/spacing';
import { buildBorderClasses } from '../../tokens/borders';
import { cn } from '../../utils/cn';

export type BoxProps = SpacingProps &
  BorderProps & {
    as?: ElementType;
    id?: string;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
  };

export const Box: React.FC<BoxProps> = ({
  as: Component = 'div',
  id,
  className,
  style,
  children,
  // Spacing
  padding, paddingX, paddingY, paddingTop, paddingBottom,
  margin, marginX, marginY, marginTop, marginBottom,
  gap,
  // Borders
  border, borderColor, radius,
  ...rest
}) => {
  const spacingClasses = buildSpacingClasses({
    padding, paddingX, paddingY, paddingTop, paddingBottom,
    margin, marginX, marginY, marginTop, marginBottom,
    gap,
  });
  const borderClasses = buildBorderClasses({ border, borderColor, radius });

  return (
    <Component
      id={id}
      className={cn(spacingClasses, borderClasses, className)}
      style={style}
      {...rest}
    >
      {children}
    </Component>
  );
};

Box.displayName = 'Box';

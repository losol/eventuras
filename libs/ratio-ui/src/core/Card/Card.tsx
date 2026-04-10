import React, { ReactNode } from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import type { BorderProps } from '../../tokens/borders';
import { buildSpacingClasses } from '../../tokens/spacing';
import { buildBorderClasses } from '../../tokens/borders';
import { buildCoverImageStyle } from '../../utils/buildCoverImageStyle';
import Container from '../../layout/Container/Container';
import { cn } from '../../utils/cn';

export interface CardProps extends SpacingProps, BorderProps {
  children?: ReactNode;
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
  dark?: boolean;
  container?: boolean;
  variant?: 'default' | 'wide' | 'outline' | 'transparent';
  hoverEffect?: boolean;
  grid?: boolean;
  backgroundColorClass?: string;
  backgroundImageUrl?: string;
}

export const Card: React.FC<CardProps> = ({
  dark = false,
  container = false,
  variant = 'default',
  hoverEffect = false,
  grid = false,
  gap = 'sm',
  children,
  as: Component = 'div',
  backgroundColorClass,
  backgroundImageUrl,
  className,
  style,
  ...spacingAndBorder
}) => {
  const baseClasses = 'p-4 relative rounded-lg';
  const transitionClasses = hoverEffect ? 'transform transition duration-300 ease-in-out' : '';

  const hoverClasses = hoverEffect ? 'hover:bg-card-hover transition-colors duration-200' : '';

  const variantStyles = {
    default: 'bg-card',
    wide: 'bg-card mx-auto min-h-[33vh]',
    outline: 'border border-border-1 bg-transparent',
    transparent: 'bg-transparent',
  };

  const bgClasses = backgroundColorClass ?? variantStyles[variant];
  const gridClasses = grid ? 'grid grid-cols-1 md:grid-cols-2' : '';

  // Separate spacing and border props
  const {
    padding, paddingX, paddingY, paddingTop, paddingBottom,
    margin, marginX, marginY, marginTop, marginBottom,
    border, borderColor, radius,
    ...rest
  } = spacingAndBorder;

  const spacingClasses = buildSpacingClasses({
    padding, paddingX, paddingY, paddingTop, paddingBottom,
    margin, marginX, marginY, marginTop, marginBottom,
    gap,
  });
  const borderClasses = buildBorderClasses({ border, borderColor, radius });

  const combinedStyle = buildCoverImageStyle(backgroundImageUrl) || style;

  return (
    <Component
      className={cn(baseClasses, transitionClasses, hoverClasses, bgClasses, spacingClasses, borderClasses, gridClasses, className)}
      style={combinedStyle}
      {...rest}
    >
      {container ? <Container>{children}</Container> : children}
    </Component>
  );
};

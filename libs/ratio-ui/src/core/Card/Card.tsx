import React, { ReactNode } from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import type { BorderProps } from '../../tokens/borders';
import type { Color } from '../../tokens/colors';
import { surfaceBgClasses } from '../../tokens/colors';
import { buildSpacingClasses } from '../../tokens/spacing';
import { buildBorderClasses } from '../../tokens/borders';
import { buildCoverImageStyle } from '../../utils/buildCoverImageStyle';
import { cn } from '../../utils/cn';

export interface CardProps extends SpacingProps, BorderProps {
  children?: ReactNode;
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
  color?: Color;
  /**
   * Visual treatment. `default` — branded card, border + shadow. `outline`
   * — border only. `transparent` — no chrome. `wide` — full-bleed feature
   * surface. `tile` — editorial card: quieter border, roomier padding,
   * uses the modern surface tokens. Pair with `Heading` + `<p>` (or
   * `ValueTile` for stat content).
   */
  variant?: 'default' | 'wide' | 'outline' | 'transparent' | 'tile';
  hoverEffect?: boolean;
  backgroundImageUrl?: string;
  testId?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hoverEffect = false,
  gap = 'sm',
  color,
  children,
  as: Component = 'div',
  backgroundImageUrl,
  className,
  style,
  testId,
  ...spacingAndBorder
}) => {
  const baseClasses = variant === 'tile' ? 'relative rounded-lg' : 'p-4 relative rounded-lg';
  const transitionClasses = hoverEffect ? 'transform transition duration-300 ease-in-out' : '';
  const hoverClasses = hoverEffect ? 'hover:bg-card-hover transition-colors duration-200' : '';

  const variantStyles = {
    default: 'bg-card border-2 border-border-1 shadow-xs',
    wide: 'bg-card mx-auto min-h-[33vh]',
    outline: 'border border-border-1 bg-transparent',
    transparent: 'bg-transparent',
    tile: 'p-6 border border-(--border-1) bg-(--card)',
  };

  const bgClasses = color ? surfaceBgClasses[color] : variantStyles[variant];

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
      className={cn(baseClasses, transitionClasses, hoverClasses, bgClasses, spacingClasses, borderClasses, className)}
      style={combinedStyle}
      data-testid={testId}
      {...rest}
    >
      {children}
    </Component>
  );
};

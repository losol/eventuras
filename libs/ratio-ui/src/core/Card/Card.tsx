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
   * Visual treatment.
   *
   * - `default` — elevated card: 1px border, soft shadow, `rounded-xl`.
   *   Use for primary content surfaces that should read as "lifted".
   * - `tile` — flat editorial card: 1px border, no shadow, `rounded-lg`,
   *   roomier padding. Use for content tiles in grids that should sit
   *   quietly on the page.
   * - `outline` — border only, transparent fill. Functional framing.
   * - `transparent` — no chrome.
   * - `wide` — full-bleed feature surface.
   */
  variant?: 'default' | 'wide' | 'outline' | 'transparent' | 'tile';
  /**
   * Add the canonical interactive hover — surface lifts to `--card-hover`,
   * border picks up `--primary`, the card translates 1px upward, and a
   * soft Linseed-tinted glow appears. Tuned to hint, not shout. Use only
   * on cards that act as clickable surfaces (links, calls-to-action) —
   * static cards should omit this so the page doesn't twitch on cursor
   * pass-by.
   */
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
  const baseByVariant: Record<NonNullable<CardProps['variant']>, string> = {
    default: 'p-4 relative rounded-xl',
    tile: 'p-6 relative rounded-lg border border-border-1',
    outline: 'p-4 relative rounded-lg',
    transparent: 'p-4 relative rounded-lg',
    wide: 'p-4 relative rounded-lg',
  };
  const baseClasses = baseByVariant[variant];
  // Hover effect — opt-in, only meaningful for clickable surfaces.
  // tile gets the smaller glow; every other variant gets a slightly
  // bigger one to match its visual presence. All share a subtle 1px
  // lift — the goal is "hints" not "shouts".
  const hoverShadow = variant === 'tile' ? 'hover:shadow-card-hover-tile' : 'hover:shadow-card-hover';
  const transitionClasses = hoverEffect ? 'transition-all duration-200 ease-out' : '';
  const hoverClasses = hoverEffect
    ? `hover:bg-card-hover hover:border-(--primary) hover:-translate-y-px ${hoverShadow}`
    : '';

  const variantStyles = {
    default: 'bg-card border border-border-2 shadow-sm',
    wide: 'bg-card mx-auto min-h-[33vh]',
    outline: 'border border-border-1 bg-transparent',
    transparent: 'bg-transparent',
    tile: 'bg-card',
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

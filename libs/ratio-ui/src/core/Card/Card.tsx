import React, { ReactNode } from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import type { BorderProps } from '../../tokens/borders';
import type { Color } from '../../tokens/colors';
import { surfaceBgClasses } from '../../tokens/colors';
import { buildSpacingClasses } from '../../tokens/spacing';
import { buildBorderClasses } from '../../tokens/borders';
import { buildCoverImageStyle } from '../../utils/buildCoverImageStyle';
import { cn } from '../../utils/cn';

export type CardShadow = 'none' | 'xs' | 'sm' | 'md';

export interface CardProps extends SpacingProps, BorderProps {
  children?: ReactNode;
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Semantic surface tint. Maps to `bg-{color}-50` in light and
   * `bg-{color}-950` in dark via `surfaceBgClasses`. Overrides the
   * default `--card` fill.
   */
  color?: Color;
  /**
   * Drop the fill, leaving the card transparent. Pair with `border`
   * (from `BorderProps`) when you want an outlined transparent card.
   */
  transparent?: boolean;
  /**
   * Drop shadow. Defaults to `'xs'` for filled cards, `'none'` for
   * transparent ones.
   */
  shadow?: CardShadow;
  /**
   * Add the canonical interactive hover — surface lifts to `--card-hover`,
   * border picks up `--primary`, and a soft Linseed-tinted glow appears.
   * Tuned to hint, not shout; the card stays put so cursor pass-by
   * doesn't make text twitch. Use only on cards that act as clickable
   * surfaces (links, calls-to-action).
   */
  hoverEffect?: boolean;
  backgroundImageUrl?: string;
  testId?: string;
}

const SHADOW_CLASSES: Record<CardShadow, string> = {
  none: '',
  xs: 'shadow-xs',
  sm: 'shadow-sm',
  md: 'shadow-md',
};

export const Card: React.FC<CardProps> = ({
  transparent = false,
  shadow,
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
  // Card-tier defaults — applied when consumer doesn't pass them.
  const padding = spacingAndBorder.padding ?? 'md';
  const radius = spacingAndBorder.radius ?? 'xl';
  const border = spacingAndBorder.border ?? !transparent;
  const effectiveShadow: CardShadow = shadow ?? (transparent ? 'none' : 'xs');

  const fillClass = transparent ? 'bg-transparent' : 'bg-card';

  // Hover effect — opt-in, only meaningful for clickable surfaces.
  // The smaller tile-tier glow when no shadow is present (flat editorial
  // mode); the bigger one for elevated cards.
  const hoverShadow =
    effectiveShadow === 'none' ? 'hover:shadow-card-hover-tile' : 'hover:shadow-card-hover';
  const transitionClasses = hoverEffect ? 'transition-all duration-200 ease-out' : '';
  const hoverClasses = hoverEffect
    ? `hover:bg-card-hover hover:border-(--primary) ${hoverShadow}`
    : '';

  // `transparent` takes precedence over `color` so the prop contract holds.
  const bgClasses = transparent ? fillClass : color ? surfaceBgClasses[color] : fillClass;

  const {
    padding: _padding,
    paddingX, paddingY, paddingTop, paddingBottom,
    margin, marginX, marginY, marginTop, marginBottom,
    border: _border,
    borderColor,
    radius: _radius,
    ...rest
  } = spacingAndBorder;

  const spacingClasses = buildSpacingClasses({
    padding,
    paddingX, paddingY, paddingTop, paddingBottom,
    margin, marginX, marginY, marginTop, marginBottom,
    gap,
  });
  const borderClasses = buildBorderClasses({ border, borderColor, radius });

  const combinedStyle = buildCoverImageStyle(backgroundImageUrl) || style;

  return (
    <Component
      className={cn(
        'relative',
        bgClasses,
        borderClasses,
        SHADOW_CLASSES[effectiveShadow],
        transitionClasses,
        hoverClasses,
        spacingClasses,
        className,
      )}
      style={combinedStyle}
      data-testid={testId}
      {...rest}
    >
      {children}
    </Component>
  );
};

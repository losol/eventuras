import React, { ReactNode } from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import type { BorderProps } from '../../tokens/borders';
import type { Color } from '../../tokens/colors';
import { surfaceBgClasses } from '../../tokens/colors';
import { buildSpacingClasses } from '../../tokens/spacing';
import { buildBorderClasses } from '../../tokens/borders';
import { cn } from '../../utils/cn';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const SIZE_CLASSES: Record<ContainerSize, string> = {
  sm: 'max-w-xl',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
};

export interface ContainerProps extends SpacingProps, BorderProps {
  children?: ReactNode;
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Max-width of the centered container. Defaults to `'lg'`.
   * - `sm`   — `max-w-xl`  (~36rem / 576px)
   * - `md`   — `max-w-3xl` (~48rem / 768px)
   * - `lg`   — `max-w-5xl` (~64rem / 1024px) — default
   * - `xl`   — `max-w-7xl` (~80rem / 1280px)
   * - `full` — no max-width
   */
  size?: ContainerSize;
  /**
   * Semantic surface tint. Maps to `bg-{color}-50` in light and
   * `bg-{color}-950` in dark via `surfaceBgClasses`.
   */
  color?: Color;
  /**
   * Marks the container as a dark surface so descendants pick up the
   * light `var(--text)` color. Useful when the Container sits on a
   * colored or photographic background.
   */
  dark?: boolean;
  testId?: string;
}

export const Container: React.FC<ContainerProps> = ({
  size = 'lg',
  color,
  dark = false,
  children,
  as: Component = 'div',
  className,
  style,
  testId,
  ...spacingAndBorder
}) => {
  const {
    padding, paddingX, paddingY, paddingTop, paddingBottom,
    margin, marginX, marginY, marginTop, marginBottom,
    gap,
    border, borderColor, radius,
    ...rest
  } = spacingAndBorder;

  const spacingClasses = buildSpacingClasses({
    padding,
    paddingX,
    paddingY, paddingTop, paddingBottom,
    margin, marginX, marginY, marginTop, marginBottom,
    gap,
  });
  const borderClasses = buildBorderClasses({ border, borderColor, radius });

  const bgClasses = color ? surfaceBgClasses[color] : undefined;

  // Only auto-center horizontally when the caller hasn't set their own
  // horizontal margin (which would otherwise be overridden by mx-auto).
  const autoCenter = !margin && !marginX;

  // Default horizontal padding so Container gives content breathing room
  // against the viewport edge on narrow screens. Skipped when the caller
  // has provided their own horizontal padding via `padding` or `paddingX`.
  const defaultPx =
    padding === undefined && paddingX === undefined ? 'px-3 sm:px-4 lg:px-6' : undefined;

  return (
    <Component
      className={cn(
        autoCenter && 'mx-auto',
        'w-full',
        SIZE_CLASSES[size],
        defaultPx,
        bgClasses,
        borderClasses,
        spacingClasses,
        dark && 'surface-dark',
        className,
      )}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {children}
    </Component>
  );
};

Container.displayName = 'Container';

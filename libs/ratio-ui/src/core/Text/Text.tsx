import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses } from '../../tokens/spacing';
import type { Color } from '../../tokens/colors';
import { cn } from '../../utils/cn';

export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
export type TextWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
export type TextVariant = 'default' | 'muted' | 'subtle';
export type TextColor = Exclude<Color, 'neutral'>;

interface TextBaseProps extends SpacingProps {
  as?: 'p' | 'span';
  size?: TextSize;
  weight?: TextWeight;
  variant?: TextVariant;
  color?: TextColor;
  className?: string;
  icon?: React.ReactNode;
  testId?: string;
}

export type TextProps = TextBaseProps &
  ({ children: React.ReactNode; text?: never } | { text: string | null; children?: never });

const sizeClasses: Record<TextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
};

const weightClasses: Record<TextWeight, string> = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const variantClasses: Record<TextVariant, string> = {
  default: '',
  muted: 'text-text-muted',
  subtle: 'text-text-subtle',
};

const colorClasses: Record<TextColor, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
  error: 'text-error-text',
  success: 'text-success-text',
  warning: 'text-warning-text',
  info: 'text-info-text',
};

export const Text: React.FC<TextProps> = ({
  children,
  text,
  as: Component = 'p',
  size,
  weight,
  variant = 'default',
  color,
  className = '',
  icon,
  padding, paddingX, paddingY, paddingTop, paddingBottom,
  margin, marginX, marginY, marginTop, marginBottom,
  gap,
  testId,
  ...restHtmlProps
}: TextProps) => {
  const renderable = text ?? children;
  if (renderable == null) return null;

  const classes = cn(
    color ? colorClasses[color] : variantClasses[variant],
    size && sizeClasses[size],
    weight && weightClasses[weight],
    buildSpacingClasses({ padding, paddingX, paddingY, paddingTop, paddingBottom, margin, marginX, marginY, marginTop, marginBottom, gap }),
    className,
  );

  return (
    <Component
      className={classes || undefined}
      data-testid={testId}
      {...restHtmlProps}
    >
      {icon && <span className="mr-2 inline-flex items-center">{icon}</span>}
      {renderable}
    </Component>
  );
};

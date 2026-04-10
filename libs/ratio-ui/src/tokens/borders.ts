/**
 * Border types and class builder
 */

import type { Color } from './colors';

export type BorderVariant = 'default' | 'strong' | 'subtle';

export interface BorderProps {
  border?: boolean | BorderVariant;
  borderColor?: 'default' | 'subtle' | 'strong' | Color;
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const radiusMap: Record<NonNullable<BorderProps['radius']>, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

const borderColorMap: Record<NonNullable<BorderProps['borderColor']>, string> = {
  default: 'border-border-1',
  subtle: 'border-border-1',
  strong: 'border-border-2',
  neutral: 'border-neutral-300',
  primary: 'border-primary-400',
  secondary: 'border-secondary-400',
  accent: 'border-accent-400',
  success: 'border-success-border',
  warning: 'border-warning-border',
  error: 'border-error-border',
  info: 'border-info-border',
};

export function buildBorderClasses(props: BorderProps): string {
  const classes: string[] = [];

  if (props.border) {
    const variant = props.border === true ? 'default' : props.border;
    switch (variant) {
      case 'default':
        classes.push('border');
        break;
      case 'strong':
        classes.push('border-2');
        break;
      case 'subtle':
        classes.push('border border-dashed');
        break;
    }

    // Default border color when none specified
    if (!props.borderColor) {
      classes.push('border-border-1');
    }
  }

  if (props.borderColor) {
    classes.push(borderColorMap[props.borderColor]);
  }

  if (props.radius) {
    classes.push(radiusMap[props.radius]);
  }

  return classes.join(' ');
}

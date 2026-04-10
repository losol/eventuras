import React, { ReactNode } from 'react';
import type { Status } from '../../tokens/colors';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export type PanelVariant = 'alert' | 'callout' | 'notice';

export interface PanelProps extends SpacingProps {
  children: ReactNode;
  variant?: PanelVariant;
  status?: Status;
  className?: string;
}

const baseClasses = 'py-3 px-4 rounded-md text-sm leading-relaxed';

const variantClasses: Record<PanelVariant, string> = {
  alert: 'border-l-4',
  callout: 'border bg-transparent',
  notice: 'border',
};

const statusClasses: Record<PanelVariant, Record<Status, string>> = {
  alert: {
    info: 'bg-info-bg border-info-border text-info-text',
    success: 'bg-success-bg border-success-border text-success-text',
    warning: 'bg-warning-bg border-warning-border text-warning-text',
    error: 'bg-error-bg border-error-border text-error-text',
    neutral: 'bg-neutral-100 border-neutral-400 text-neutral-700',
  },
  callout: {
    info: 'border-info-border text-info-text bg-info-bg',
    success: 'border-success-border text-success-text bg-success-bg',
    warning: 'border-warning-border text-warning-text bg-warning-bg',
    error: 'border-error-border text-error-text bg-error-bg',
    neutral: 'border-neutral-300 text-neutral-700 bg-neutral-50',
  },
  notice: {
    info: 'bg-info-bg border-info-border text-info-text',
    success: 'bg-success-bg border-success-border text-success-text',
    warning: 'bg-warning-bg border-warning-border text-warning-text',
    error: 'bg-error-bg border-error-border text-error-text',
    neutral: 'bg-neutral-100 border-neutral-400 text-neutral-700',
  },
};

export const Panel: React.FC<PanelProps> = ({
  children,
  variant = 'alert',
  status = 'info',
  className,
  ...spacingProps
}) => {
  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        statusClasses[variant][status],
        buildSpacingClasses(spacingProps),
        className,
      )}
      role={variant === 'alert' ? 'alert' : undefined}
    >
      {children}
    </div>
  );
};

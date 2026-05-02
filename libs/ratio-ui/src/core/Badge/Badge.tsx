import React from 'react';
import type { Status } from '../../tokens/colors';
import { cn } from '../../utils/cn';

export type BadgeVariant = 'filled' | 'subtle';

export type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  status?: Status;
  /**
   * Visual treatment.
   * - `'filled'` (default) — solid status-tinted background with white
   *   text. Use for prominent indicators where the badge needs to read
   *   from across the page.
   * - `'subtle'` — outline pill with mono-uppercase text on a quiet
   *   tinted background. Use as a category tag or kicker where the
   *   badge sits inside a larger card or list row and shouldn't shout.
   */
  variant?: BadgeVariant;
  block?: boolean;
  definition?: boolean;
  label?: string;
};

const filledStatusClasses: Record<Status, string> = {
  neutral: 'bg-neutral-700 dark:bg-neutral-800 text-white',
  info: 'bg-info text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  error: 'bg-error text-white',
};

const subtleStatusClasses: Record<Status, string> = {
  neutral: 'bg-card border border-border-1 text-(--text-muted)',
  info: 'bg-(--info-bg) border border-(--info-border) text-(--info-text)',
  success: 'bg-(--success-bg) border border-(--success-border) text-(--success-text)',
  warning: 'bg-(--warning-bg) border border-(--warning-border) text-(--warning-text)',
  error: 'bg-(--error-bg) border border-(--error-border) text-(--error-text)',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  status = 'neutral',
  variant = 'filled',
  block = false,
  definition = false,
  label,
}) => {
  const isSubtle = variant === 'subtle';
  const variantClasses = isSubtle ? subtleStatusClasses[status] : filledStatusClasses[status];

  const base = cn(
    block && 'block',
    variantClasses,
    'leading-none',
    isSubtle
      ? 'font-mono text-[10px] uppercase tracking-wider font-bold rounded-full'
      : 'text-xs rounded',
  );

  if (definition && label) {
    return (
      <span className={cn(base, 'flex overflow-hidden', className)}>
        <dt
          className={cn(
            'px-2 py-2 font-medium uppercase tracking-wide',
            isSubtle ? 'bg-(--text-muted)/10' : 'bg-black/20',
          )}
        >
          {label}
        </dt>
        <dd className="px-2 py-2 m-0">{children}</dd>
      </span>
    );
  }

  return (
    <span className={cn(base, isSubtle ? 'px-2 py-1' : 'p-2', className)}>
      {children}
    </span>
  );
};

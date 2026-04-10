import React from 'react';
import type { Status } from '../../tokens/colors';
import { cn } from '../../utils/cn';

export type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  status?: Status;
  block?: boolean;
  definition?: boolean;
  label?: string;
};

const statusClasses: Record<Status, string> = {
  neutral: 'bg-neutral-700 dark:bg-neutral-800',
  info: 'bg-info dark:bg-info',
  success: 'bg-success dark:bg-success',
  warning: 'bg-warning dark:bg-warning',
  error: 'bg-error dark:bg-error',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  status = 'neutral',
  block = false,
  definition = false,
  label,
}) => {
  const base = cn(
    block && 'block',
    statusClasses[status],
    'text-xs leading-none text-white rounded',
  );

  if (definition && label) {
    return (
      <span className={cn(base, 'flex overflow-hidden', className)}>
        <dt className="bg-black/20 px-2 py-2 font-medium uppercase tracking-wide">
          {label}
        </dt>
        <dd className="px-2 py-2 m-0">
          {children}
        </dd>
      </span>
    );
  }

  return <span className={cn(base, 'p-2', className)}>{children}</span>;
};

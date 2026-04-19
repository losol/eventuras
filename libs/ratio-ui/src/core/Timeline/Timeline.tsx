import React from 'react';
import type { Status } from '../../tokens/colors';
import { cn } from '../../utils/cn';

const dotStatusClasses: Record<Status, string> = {
  neutral: 'bg-neutral-400 dark:bg-neutral-600',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
};

export interface TimelineProps {
  children: React.ReactNode;
  className?: string;
  testId?: string;
}

export interface TimelineItemProps {
  children?: React.ReactNode;
  className?: string;
  /** Timestamp — callers format it (e.g. via Intl.DateTimeFormat). */
  timestamp: React.ReactNode;
  /** Main line describing the event. */
  title: React.ReactNode;
  /** Optional "who did it" — rendered inline next to the timestamp. */
  actor?: React.ReactNode;
  /** Dot color — defaults to neutral. */
  status?: Status;
  /**
   * Optional custom dot content. Replaces the solid dot entirely. Useful for
   * small icons (e.g. Lucide) sized at h-3 w-3.
   */
  icon?: React.ReactNode;
  testId?: string;
}

const Root: React.FC<TimelineProps> = ({ children, className, testId }) => (
  <ol className={cn('relative m-0 list-none p-0', className)} data-testid={testId}>
    {children}
  </ol>
);

const Item: React.FC<TimelineItemProps> = ({
  children,
  className,
  timestamp,
  title,
  actor,
  status = 'neutral',
  icon,
  testId,
}) => (
  <li
    className={cn(
      'relative border-l-2 border-gray-200 pb-6 pl-6 last:border-transparent last:pb-0 dark:border-gray-800',
      className,
    )}
    data-testid={testId}
  >
    <span
      className={cn(
        'absolute left-0 top-1 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full ring-4 ring-white dark:ring-neutral-950',
        !icon && dotStatusClasses[status],
      )}
      aria-hidden="true"
    >
      {icon}
    </span>
    <div className="flex flex-wrap items-baseline gap-x-2 text-xs text-neutral-600 dark:text-neutral-400">
      <time>{timestamp}</time>
      {actor && <span>· {actor}</span>}
    </div>
    <div className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">
      {title}
    </div>
    {children && <div className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{children}</div>}
  </li>
);

/**
 * Vertical timeline for chronological event lists (audit logs, order history,
 * registration activity, business events).
 *
 * @beta This component is experimental. The prop shape and visual design may
 * change before release.
 *
 * @example
 * <Timeline>
 *   <Timeline.Item timestamp="2026-04-19 10:22" title="Order created" status="success" />
 *   <Timeline.Item timestamp="2026-04-19 10:25" title="Payment method updated" actor="Ada">
 *     <pre>{JSON.stringify(metadata, null, 2)}</pre>
 *   </Timeline.Item>
 * </Timeline>
 */
export const Timeline = Object.assign(Root, {
  Item,
});

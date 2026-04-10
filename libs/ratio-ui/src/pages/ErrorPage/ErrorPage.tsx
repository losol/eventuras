import React from 'react';
import type { Status } from '../../tokens/colors';
import { cn } from '../../utils/cn';

/** See: {@link ErrorPage} */
export interface ErrorPageProps {
  /** Visual style preset */
  status?: Status;
  /** Fullscreen wrapper */
  fullScreen?: boolean;
  /** Custom classes */
  className?: string;
  /** Children slots */
  children: React.ReactNode;
}

const statusCls: Record<Status, string> = {
  neutral: 'bg-neutral-100 border-neutral-500 text-neutral-800',
  info:    'bg-info-bg border-info-border text-info-text',
  success: 'bg-success-bg border-success-border text-success-text',
  warning: 'bg-warning-bg border-warning-border text-warning-text',
  error:   'bg-error-bg border-error-border text-error-text',
};

function StatusIcon({ status }: { status: Status }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7 mr-2">
      {(status === 'error' || status === 'neutral') && (
        <path d="M12 9v4m0 4h.01M12 2a10 10 0 110 20 10 10 0 010-20z"
              stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {status === 'warning' && (
        <path d="M12 9v4m0 4h.01M10.29 3.86l-8.48 14.7a1.5 1.5 0 001.29 2.24h16.18a1.5 1.5 0 001.29-2.24l-8.48-14.7a1.5 1.5 0 00-2.58 0z"
              stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {status === 'info' && (
        <path d="M12 8h.01M11 12h2v4h-2z M12 2a10 10 0 110 20 10 10 0 010-20z"
              stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {status === 'success' && (
        <path d="M20 6l-11 11-5-5"
              stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function Root({ status = 'error', fullScreen = true, className, children }: ErrorPageProps) {
  return (
    <div className={cn(fullScreen ? 'fixed inset-0' : 'relative', 'bg-black/90 flex p-10')}>
      <div
        className={cn('w-full border-l-4 p-6 self-center', statusCls[status], className)}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start">
          <StatusIcon status={status} />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <h1 className="text-2xl font-bold">{children}</h1>;
}

function Description({ children }: { children: React.ReactNode }) {
  return <p className="mt-2">{children}</p>;
}

function Extra({ children }: { children: React.ReactNode }) {
  return <div className="mt-4">{children}</div>;
}

function Action({ children }: { children: React.ReactNode }) {
  return <div className="mt-6">{children}</div>;
}

export const ErrorPage = Object.assign(Root, {
  Title,
  Description,
  Extra,
  Action,
});

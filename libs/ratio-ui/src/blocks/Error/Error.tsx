import React from 'react';
import clsx from 'clsx';

/** Error severity/tone for visual styling */
export type ErrorTone = 'error' | 'warning' | 'info';

/** Error type for semantic meaning */
export type ErrorType =
  | 'not-found'
  | 'forbidden'
  | 'server-error'
  | 'network-error'
  | 'generic';

/** Props for {@link Error} */
export interface ErrorProps {
  /** Visual severity/tone */
  tone?: ErrorTone;
  /** Semantic error type (affects icon) */
  type?: ErrorType;
  /** Custom className for the container */
  className?: string;
  /** Child components (Title, Description, Actions) */
  children: React.ReactNode;
}

/** Map tone → colors */
const toneStyles: Record<ErrorTone, string> = {
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
};

/** Icon for each error type */
function ErrorIcon({ type = 'generic', tone = 'error' }: { type: ErrorType; tone: ErrorTone }) {
  const colorClass = toneStyles[tone];
  const baseClass = 'w-12 h-12 mb-4';

  if (type === 'not-found') {
    return (
      <svg
        className={clsx(baseClass, colorClass)}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }

  if (type === 'forbidden') {
    return (
      <svg
        className={clsx(baseClass, colorClass)}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
        />
      </svg>
    );
  }

  if (type === 'server-error') {
    return (
      <svg
        className={clsx(baseClass, colorClass)}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
        />
      </svg>
    );
  }

  if (type === 'network-error') {
    return (
      <svg
        className={clsx(baseClass, colorClass)}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
        />
      </svg>
    );
  }

  // generic error
  return (
    <svg
      className={clsx(baseClass, colorClass)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/** Root component for error display */
function Root({
  tone = 'error',
  type = 'generic',
  className,
  children
}: ErrorProps) {
  return (
    <div
      className={clsx('py-12 text-center', className)}
      role="alert"
      aria-live="polite"
    >
      <div className="flex flex-col items-center">
        <ErrorIcon type={type} tone={tone} />
        {children}
      </div>
    </div>
  );
}

/** Title slot */
function Title({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1 className={clsx('text-2xl font-bold mb-4', className)}>
      {children}
    </h1>
  );
}

/** Description/message slot */
function Description({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={clsx('text-base mb-2 max-w-2xl', className)}>
      {children}
    </p>
  );
}

/** Technical details slot (smaller, muted text) */
function Details({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-2xl', className)}>
      {children}
    </div>
  );
}

/** Actions/buttons slot */
function Actions({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex flex-wrap gap-4 justify-center mt-6', className)}>
      {children}
    </div>
  );
}

/** Export compound component */
export const Error = Object.assign(Root, {
  Title,
  Description,
  Details,
  Actions,
});

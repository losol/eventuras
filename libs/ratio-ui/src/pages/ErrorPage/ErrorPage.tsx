import React from 'react';
import clsx from 'clsx';

/** See: {@link ErrorPageProps} */
export type ErrorTone = 'fatal' | 'warning' | 'info' | 'success';

/** See: {@link ErrorPage} */
export interface ErrorPageProps {
  /** Visual style preset */
  tone?: ErrorTone;
  /** Fullscreen wrapper */
  fullScreen?: boolean;
  /** Custom classes */
  className?: string;
  /** Children slots */
  children: React.ReactNode;
}

/** Map tone → panel styles */
const toneCls: Record<ErrorTone, string> = {
  fatal:   'bg-red-100 border-red-500 text-red-800',
  warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
  info:    'bg-blue-100 border-blue-500 text-blue-800',
  success: 'bg-green-100 border-green-500 text-green-800',
};

/** Minimal icon per tone */
function ToneIcon({ tone }: { tone: ErrorTone }) {
  // ➜ Pick size + pulse for emphasis
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7 mr-2">
      {/* ➜ Simple stroke icon */}
      {tone === 'fatal' && (
        <path d="M12 9v4m0 4h.01M12 2a10 10 0 110 20 10 10 0 010-20z"
              stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {tone === 'warning' && (
        <path d="M12 9v4m0 4h.01M10.29 3.86l-8.48 14.7a1.5 1.5 0 001.29 2.24h16.18a1.5 1.5 0 001.29-2.24l-8.48-14.7a1.5 1.5 0 00-2.58 0z"
              stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {tone === 'info' && (
        <path d="M12 8h.01M11 12h2v4h-2z M12 2a10 10 0 110 20 10 10 0 010-20z"
              stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {tone === 'success' && (
        <path d="M20 6l-11 11-5-5"
              stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/** See: {@link ErrorPageProps} */
function Root({ tone = 'fatal', fullScreen = true, className, children }: ErrorPageProps) {
  // ➜ Choose container sizing
  const container = fullScreen ? 'fixed inset-0' : 'relative';
  // ➜ Root wrapper
  const root = clsx(container, 'bg-black/90 flex p-10');
  // ➜ Panel with tone style
  const panel = clsx('w-full border-l-4 p-6 self-center', toneCls[tone], className);

  return (
    <div className={root}>
      <div className={panel} role="alert" aria-live="assertive">
        <div className="flex items-start">
          <ToneIcon tone={tone} />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Title slot */
function Title({ children }: { children: React.ReactNode }) {
  return <h1 className="text-2xl font-bold">{children}</h1>;
}

/** Description slot */
function Description({ children }: { children: React.ReactNode }) {
  return <p className="mt-2">{children}</p>;
}

/** Extra content slot */
function Extra({ children }: { children: React.ReactNode }) {
  return <div className="mt-4">{children}</div>;
}

/** Action slot */
function Action({ children }: { children: React.ReactNode }) {
  return <div className="mt-6">{children}</div>;
}

/** Export compound API */
export const ErrorPage = Object.assign(Root, {
  Title,
  Description,
  Extra,
  Action,
});

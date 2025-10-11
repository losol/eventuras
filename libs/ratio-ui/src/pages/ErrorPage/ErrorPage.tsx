import React from 'react';
import clsx from 'clsx';
import { AlertCircle, AlertTriangle, Info, Check } from '../icons';

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
  const iconProps = { className: "h-7 w-7 mr-2", strokeWidth: 2 };
  
  switch (tone) {
    case 'fatal':
      return <AlertCircle {...iconProps} />;
    case 'warning':
      return <AlertTriangle {...iconProps} />;
    case 'info':
      return <Info {...iconProps} />;
    case 'success':
      return <Check {...iconProps} />;
  }
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

import React from 'react';
import { ErrorBlock } from '../../blocks/Error';

export interface ErrorBoundaryRenderProps {
  error: Error;
  reset: () => void;
}

export type ErrorBoundaryFallback =
  | React.ReactNode
  | ((args: ErrorBoundaryRenderProps) => React.ReactNode);

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Fallback UI shown when a child throws. Pass a render fn to access `error` and `reset`. */
  fallback?: ErrorBoundaryFallback;
  /** Boundary resets when any value in this array changes (shallow compare). */
  resetKeys?: ReadonlyArray<unknown>;
  /** Side-effect hook for logging / Sentry. Runs in `componentDidCatch`. */
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

function changed(a: ReadonlyArray<unknown> = [], b: ReadonlyArray<unknown> = []) {
  if (a.length !== b.length) return true;
  return a.some((v, i) => !Object.is(v, b[i]));
}

/**
 * Default fallback used when `<ErrorBoundary>` is rendered without a `fallback`
 * prop. Shows an inline `ErrorBlock` with a "Try again" button.
 *
 * The raw `error.message` is intentionally not rendered — it can include
 * implementation details or user data. Write a custom `fallback` if you need
 * to surface details (typically gated behind a dev flag).
 */
function DefaultFallback({ reset }: Readonly<ErrorBoundaryRenderProps>) {
  return (
    <ErrorBlock type="generic" status="error">
      <ErrorBlock.Title>Something went wrong</ErrorBlock.Title>
      <ErrorBlock.Description>
        This part of the page couldn't be displayed.
      </ErrorBlock.Description>
      <ErrorBlock.Actions>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded bg-error-bg border border-error-border text-error-text hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-border"
        >
          Try again
        </button>
      </ErrorBlock.Actions>
    </ErrorBlock>
  );
}

/**
 * Catches render-time errors thrown by descendants and renders a fallback
 * instead of letting the error propagate to the nearest route-level boundary.
 *
 * Does NOT catch errors in event handlers, async callbacks, or SSR — wrap
 * those in `try/catch` yourself.
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<p>Couldn't load this section.</p>}>
 *   <FlakyChild />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static DefaultFallback = DefaultFallback;

  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    // Only auto-reset when we were *already* in the fallback before this update.
    // Otherwise a resetKeys change that itself triggers a throw would clear the
    // freshly-captured error and re-render the failing child, firing onError twice.
    if (prevState.error !== null && changed(prevProps.resetKeys, this.props.resetKeys)) {
      this.reset();
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error, info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const { fallback } = this.props;
    if (typeof fallback === 'function') {
      return fallback({ error, reset: this.reset });
    }
    if (fallback !== undefined) {
      return fallback;
    }
    return <DefaultFallback error={error} reset={this.reset} />;
  }
}

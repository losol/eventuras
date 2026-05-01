import React from 'react';
import type { Status } from '../../tokens/colors';
import { cn } from '../../utils/cn';

/** Props for {@link PageOverlay} */
export interface PageOverlayProps {
  /** Status affecting overlay tint */
  status?: Status;
  /** Whether to render as fullscreen overlay (default: true) */
  fullScreen?: boolean;
  /** Custom className for the overlay container */
  className?: string;
  /** Child components to display inside the overlay */
  children: React.ReactNode;
}

const statusOverlayClasses: Record<Status, string> = {
  neutral: 'bg-black/90',
  info: 'bg-info-950/95',
  success: 'bg-success-950/95',
  warning: 'bg-warning-950/95',
  error: 'bg-error-950/95',
};

/**
 * Generic fullscreen page overlay component.
 *
 * Use this for critical content that should block the UI, such as:
 * - Fatal errors (status="error")
 * - Loading states
 * - Important messages
 * - Maintenance notices
 *
 * @example
 * ```tsx
 * <PageOverlay status="error">
 *   <ErrorBlock type="server-error" status="error">
 *     <ErrorBlock.Title>Fatal Error</ErrorBlock.Title>
 *     <ErrorBlock.Description>The application encountered a critical error.</ErrorBlock.Description>
 *   </ErrorBlock>
 * </PageOverlay>
 * ```
 */
export function PageOverlay({
  status = 'neutral',
  fullScreen = true,
  className,
  children,
}: Readonly<PageOverlayProps>) {
  return (
    <div
      className={cn(
        fullScreen ? 'fixed inset-0 z-50' : 'relative',
        statusOverlayClasses[status],
        'flex items-center justify-center p-4 sm:p-10',
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-live="assertive"
    >
      <div className="w-full max-w-2xl bg-card rounded-lg shadow-2xl p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}

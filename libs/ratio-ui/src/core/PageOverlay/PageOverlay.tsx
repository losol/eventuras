import React from 'react';
import clsx from 'clsx';

/** Props for {@link PageOverlay} */
export interface PageOverlayProps {
  /** Visual variant affecting overlay styling */
  variant?: 'default' | 'error' | 'info' | 'warning';
  /** Whether to render as fullscreen overlay (default: true) */
  fullScreen?: boolean;
  /** Custom className for the overlay container */
  className?: string;
  /** Child components to display inside the overlay */
  children: React.ReactNode;
}

/**
 * Generic fullscreen page overlay component.
 *
 * Use this for critical content that should block the UI, such as:
 * - Fatal errors (variant="error")
 * - Loading states
 * - Important messages
 * - Maintenance notices
 *
 * @example
 * ```tsx
 * import { PageOverlay } from '@eventuras/ratio-ui/core/PageOverlay';
 * import { Error } from '@eventuras/ratio-ui/blocks/Error';
 *
 * // Error overlay
 * <PageOverlay variant="error">
 *   <Error type="server-error" tone="error">
 *     <Error.Title>Fatal Error</Error.Title>
 *     <Error.Description>
 *       The application encountered a critical error.
 *     </Error.Description>
 *   </Error>
 * </PageOverlay>
 *
 * // Generic overlay
 * <PageOverlay>
 *   <div>Custom content</div>
 * </PageOverlay>
 * ```
 */
export function PageOverlay({
  variant = 'default',
  fullScreen = true,
  className,
  children
}: PageOverlayProps) {
  // Container styles - fullscreen with dark overlay
  const container = fullScreen ? 'fixed inset-0 z-50' : 'relative';

  // Variant-specific overlay colors
  const variantStyles = {
    default: 'bg-black/90',
    error: 'bg-red-950/95',
    warning: 'bg-amber-950/95',
    info: 'bg-blue-950/95',
  };

  const overlay = clsx(
    container,
    variantStyles[variant],
    'flex items-center justify-center p-4 sm:p-10',
    className
  );

  return (
    <div className={overlay} role="dialog" aria-modal="true" aria-live="assertive">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}

import { PageOverlay } from '../../core/PageOverlay';
import { Button } from '../../core/Button';

export interface SessionWarningProps {
  /**
   * Whether the warning overlay should be shown.
   */
  isOpen: boolean;

  /**
   * The reason for the session warning (e.g., 'expired', 'invalid').
   */
  reason: string;

  /**
   * Callback when user clicks "login now" button.
   */
  onLoginNow: () => void;

  /**
   * Callback when user dismisses the warning temporarily.
   */
  onDismiss: () => void;

  /**
   * Whether the login action is in progress.
   */
  isLoading?: boolean;

  /**
   * Translation function or object with warning messages.
   */
  messages: {
    title: (reason: string) => string;
    description: (reason: string) => string;
    tip?: string;
    loginButton: string;
    dismissButton: string;
  };
}

/**
 * SessionWarning displays a full-screen overlay warning users about
 * session expiration, giving them time to save their work.
 *
 * This is a pure presentational component. The parent component is
 * responsible for managing state and handling user actions.
 *
 * @example
 * ```tsx
 * <SessionWarning
 *   isOpen={!!warning}
 *   reason={warning}
 *   onLoginNow={() => router.refresh()}
 *   onDismiss={() => setWarning(null)}
 *   messages={{
 *     title: (reason) => t(`title.${reason}`),
 *     description: (reason) => t(`description.${reason}`),
 *     tip: t('tip'),
 *     loginButton: t('login'),
 *     dismissButton: t('dismiss'),
 *   }}
 * />
 * ```
 */
export function SessionWarning({
  isOpen,
  reason,
  onLoginNow,
  onDismiss,
  isLoading = false,
  messages,
}: SessionWarningProps) {
  if (!isOpen) return null;

  const title = messages.title(reason);
  const description = messages.description(reason);

  return (
    <PageOverlay variant="warning" fullScreen>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-lg">{description}</p>

        {messages.tip && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {messages.tip}
          </p>
        )}

        <div className="flex gap-3 pt-4">
          <Button variant="primary" onClick={onLoginNow} loading={isLoading}>
            {messages.loginButton}
          </Button>

          <Button variant="outline" onClick={onDismiss} disabled={isLoading}>
            {messages.dismissButton}
          </Button>
        </div>
      </div>
    </PageOverlay>
  );
}

import { PageOverlay } from '../../core/PageOverlay';
import { Button } from '../../core/Button';

export interface SessionWarningProps {
  /**
   * Whether the warning overlay should be shown.
   */
  isOpen: boolean;

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
   * Warning messages to display.
   */
  messages: {
    title: string;
    description: string;
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
 *   isOpen={isExpired}
 *   onLoginNow={() => router.refresh()}
 *   onDismiss={() => setWarning(null)}
 *   messages={{
 *     title: t('title.expired'),
 *     description: t('description.expired'),
 *     tip: t('tip'),
 *     loginButton: t('login'),
 *     dismissButton: t('dismiss'),
 *   }}
 * />
 * ```
 */
export function SessionWarning({
  isOpen,
  onLoginNow,
  onDismiss,
  isLoading = false,
  messages,
}: SessionWarningProps) {
  if (!isOpen) return null;

  return (
    <PageOverlay variant="warning" fullScreen>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{messages.title}</h1>
        <p className="text-lg">{messages.description}</p>

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

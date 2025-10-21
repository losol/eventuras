'use client';

import { useState } from 'react';

import { Button } from '@eventuras/ratio-ui/core/Button';
import { Menu } from '@eventuras/ratio-ui/core/Menu';

import { useAuthActions, useAuthSelector } from '@/auth/authMachine';

/**
 * Translation strings for the user menu
 */
export type UserMenuTranslations = {
  // Logged out state
  loginLabel: string;

  // Logged in state
  userLabel: string;
  accountLabel: string;
  adminLabel: string;
};

export interface UserMenuProps {
  translations: UserMenuTranslations;
}

/**
 * Redirects to OAuth login endpoint
 * Uses window.location to avoid CORS preflight issues with Auth0
 */
function redirectToLogin() {
  window.location.href = '/api/login';
}

/**
 * User menu button component - used for both login button and user name display
 * Provides consistent styling and loading states
 */
function UserMenuButton({
  label,
  onClick,
  loading = false,
  testId,
}: {
  label: string;
  onClick: () => void;
  loading?: boolean;
  testId?: string;
}) {
  return (
    <Button onClick={onClick} variant="primary" loading={loading} testId={testId}>
      {label}
    </Button>
  );
}

/**
 * Login button displayed when user is not authenticated
 */
function LoginButton({ label }: { label: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    redirectToLogin();
  };

  return (
    <UserMenuButton label={label} onClick={handleClick} loading={isLoading} testId="login-button" />
  );
}

/**
 * User menu dropdown displayed when user is authenticated
 */
function UserDropdownMenu({
  userName,
  isAdmin,
  hasWarning,
  translations,
  onLogout,
}: {
  userName: string;
  isAdmin: boolean;
  hasWarning: boolean;
  translations: Pick<UserMenuTranslations, 'userLabel' | 'accountLabel' | 'adminLabel'>;
  onLogout: () => void;
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    onLogout();
    // Redirect to logout endpoint which clears cookies
    window.location.href = '/api/logout';
  };

  // Add warning indicator to menu label if session is unstable
  const menuLabel = hasWarning ? `⚠️ ${userName}` : userName;

  return (
    <Menu menuLabel={menuLabel}>
      <Menu.Link testId="profile-link" href="/user">
        {translations.userLabel}
      </Menu.Link>
      <Menu.Link href="/user/account">{translations.accountLabel}</Menu.Link>
      {isAdmin && <Menu.Link href="/admin">{translations.adminLabel}</Menu.Link>}
      <Menu.Button id="logout-button" onClick={handleLogout} isDisabled={isLoggingOut}>
        {isLoggingOut ? 'Logging out...' : 'Logg ut'}
      </Menu.Button>
    </Menu>
  );
}

/**
 * User menu component that displays login button or user menu based on auth status
 * Now powered by XState authentication machine for robust state management
 */
export default function UserMenu({ translations }: UserMenuProps) {
  const authState = useAuthSelector();
  const { isAuthenticated, isAdmin, user, status } = authState;
  const { logout } = useAuthActions();

  // Show minimal placeholder during initialization to avoid flash
  // This creates a smooth transition to either login button or user menu
  if (status.isInitializing) {
    return <div className="w-20 h-10" aria-label="Loading..." />;
  }

  // Show login button if not authenticated
  if (!isAuthenticated) {
    return <LoginButton label={translations.loginLabel} />;
  }

  // Show warning indicator if token is being refreshed
  const hasWarning = status.isRefreshingToken;

  return (
    <UserDropdownMenu
      userName={user?.name || 'User'}
      isAdmin={isAdmin}
      hasWarning={hasWarning}
      translations={translations}
      onLogout={logout}
    />
  );
}

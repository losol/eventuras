'use client';

import { useEffect, useState } from 'react';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Menu } from '@eventuras/ratio-ui/core/Menu';
import { getAuthStatus, type AuthStatus } from '@/utils/auth/getAuthStatus';

export type LoggedOutLanguagePack = {
  loginLabel: string;
};

export type LogginInLanguagePack = {
  userLabel: string;
  accountLabel: string;
  adminLabel: string;
  logoutButtonLabel: string;
};

export type UserMenuContentLoggedOutProps = {
  onLoginRequested: () => void;
  languagePack: LoggedOutLanguagePack;
};

export type UserMenuContentLoggedInProps = {
  menuLabel: string;
  isAdmin: boolean;
  languagePack: LogginInLanguagePack;
};

const UserMenuContentLoggedOut = (props: UserMenuContentLoggedOutProps) => {
  return (
    <Button
      onClick={() => props.onLoginRequested()}
      variant="primary"
      testId="login-button"
    >
      {props.languagePack.loginLabel}
    </Button>
  );
};

const UserMenuContentLoggedIn = (props: UserMenuContentLoggedInProps) => {
  const { accountLabel, adminLabel, userLabel } = props.languagePack;
  return (
    <Menu menuLabel={props.menuLabel}>
      <Menu.Link testId="profile-link" href="/user">
        {userLabel}
      </Menu.Link>
      <Menu.Link href="/user/account">{accountLabel}</Menu.Link>
      {props.isAdmin && <Menu.Link href="/admin">{adminLabel}</Menu.Link>}
    </Menu>
  );
};

function useAuthStatus(): { status: AuthStatus | null; loading: boolean } {
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const data = await getAuthStatus();
        if (isMounted) {
          setStatus(data);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setStatus({ authenticated: false });
          setLoading(false);
        }
      }
    };

    // Initial check and periodic refresh
    checkAuth();
    const interval = setInterval(checkAuth, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { status, loading };
}

interface UserMenuProps {
  loggedInContent: LogginInLanguagePack;
  LoggedOutContent: LoggedOutLanguagePack;
}

const UserMenu = (props: UserMenuProps) => {
  const { status, loading: sessionLoading } = useAuthStatus();

  const handleLogin = () => {
    // Use window.location.href for OAuth redirect to avoid CORS preflight
    // router.push() triggers a fetch request which causes CORS issues with Auth0
    window.location.href = '/api/login';
  };

  // Don't render anything until status is loaded
  if (sessionLoading) {
    return null;
  }

  if (!status || !status.authenticated || !status.user) {
    return (
      <UserMenuContentLoggedOut
        onLoginRequested={handleLogin}
        languagePack={props.LoggedOutContent}
      />
    );
  }

  // Get user name and roles from auth status (JWT token)
  const userName = status.user.name || status.user.email || '';
  const isAdmin = status.user.roles?.includes('Admin') ?? false;

  return (
    <UserMenuContentLoggedIn
      isAdmin={isAdmin}
      menuLabel={userName}
      languagePack={props.loggedInContent}
    />
  );
};

export default UserMenu;

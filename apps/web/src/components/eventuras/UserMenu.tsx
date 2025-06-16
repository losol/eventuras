'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Menu } from '@eventuras/ratio-ui/core/Menu';
import { DATA_TEST_ID } from '@eventuras/utils';
import type { SessionStatus } from '@/app/api/session/route';

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
      {...{ [DATA_TEST_ID]: 'login-button' }}
    >
      {props.languagePack.loginLabel}
    </Button>
  );
};

const UserMenuContentLoggedIn = (props: UserMenuContentLoggedInProps) => {
  const { accountLabel, adminLabel, userLabel } = props.languagePack;
  return (
    <Menu menuLabel={props.menuLabel}>
      <Menu.Link {...{ [DATA_TEST_ID]: 'profile-link' }} href="/user">
        {userLabel}
      </Menu.Link>
      <Menu.Link href="/user/account">{accountLabel}</Menu.Link>
      {props.isAdmin && <Menu.Link href="/admin">{adminLabel}</Menu.Link>}
    </Menu>
  );
};

function useSessionStatus(): { status: SessionStatus | null; loading: boolean } {
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshAttempted, setRefreshAttempted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/session');
        let data: SessionStatus = await res.json();

        if (data.sessionExpired && !refreshAttempted) {
          setRefreshAttempted(true);
          const refreshRes = await fetch('/api/session', { method: 'POST' });
          const refreshData: SessionStatus = await refreshRes.json();

          if (refreshData.authenticated) {
            data = refreshData;
          }
        }

        if (isMounted) {
          setStatus(data);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setStatus({
            authenticated: false,
            sessionExpired: true,
            errors: [
              {
                source: 'unknown',
                message: 'Failed to fetch session status',
              },
            ],
          });
          setLoading(false);
        }
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
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
  const router = useRouter();
  const { status, loading } = useSessionStatus();

  const handleLogin = async () => {
    router.push('/api/login');
  };

  // Don't render anything until status is loaded
  if (loading) {
    return null;
  }

  const hasError = Array.isArray(status?.errors) && status.errors.length > 0;

  if (hasError) {
    return (
      <Button onClick={handleLogin} variant="primary" {...{ [DATA_TEST_ID]: 'login-button' }}>
        🔴 Log in again
      </Button>
    );
  }

  if (!status || !status.authenticated || !status.user) {
    return (
      <UserMenuContentLoggedOut
        onLoginRequested={handleLogin}
        languagePack={props.LoggedOutContent}
      />
    );
  }

  const userName = status.user.name ?? '';
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

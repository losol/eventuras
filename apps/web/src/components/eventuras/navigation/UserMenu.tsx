'use client';
import { useRouter } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';

import { useAuthSelector } from '@/statemachines/AuthenticationFlowMachine';
import Environment from '@/utils/Environment';

import UserMenuContent, { LoggedOutLanguagePack, LogginInLanguagePack } from './UserMenuContent';

interface UserMenuProps {
  loggedInContent: LogginInLanguagePack;
  LoggedOutContent: LoggedOutLanguagePack;
}
export const UserMenu = (props: UserMenuProps) => {
  const router = useRouter();

  const { idToken, isAuthenticated, isAdmin, userProfile } = useAuthSelector();

  const handleLogin = async () => {
    await signIn('auth0');
    //fetchUserProfile();
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    const returnUrl = encodeURI(Environment.NEXT_PUBLIC_LOGOUT_URL_REDIRECT);
    const logOutUrl = `https://${Environment.NEXT_PUBLIC_AUTH0_DOMAIN}/oidc/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${returnUrl}`;
    router.push(logOutUrl);
  };

  if (isAuthenticated) {
    return (
      <UserMenuContent.LoggedIn
        isAdmin={isAdmin}
        menuLabel={userProfile?.name ?? ''}
        onLogoutRequested={handleLogout}
        languagePack={props.loggedInContent}
      />
    );
  }

  return (
    <UserMenuContent.LoggedOut
      onLoginRequested={handleLogin}
      languagePack={props.LoggedOutContent}
    />
  );
};

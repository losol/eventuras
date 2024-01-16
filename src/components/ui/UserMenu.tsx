'use client';

import { useRouter } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import createTranslation from 'next-translate/createTranslation';
import { useContext } from 'react';

import Button from '@/components/ui/Button';
import Menu from '@/components/ui/Menu';
import { UserContext } from '@/context';
import Environment from '@/utils/Environment';

interface UserMenuProps {
  bgDark?: boolean;
}

const UserMenu = (props: UserMenuProps) => {
  const { t } = createTranslation();
  const { fetchUserProfile, userState } = useContext(UserContext);
  const router = useRouter();

  const handleLogin = async () => {
    await signIn('auth0');
    fetchUserProfile();
  };

  const handleLogout = async () => {
    const idToken = userState.auth?.session.id_token;
    const returnUrl = encodeURI(Environment.NEXT_PUBLIC_LOGOUT_URL_REDIRECT);
    await signOut({ redirect: false });
    const logOutUrl = `https://${Environment.NEXT_PUBLIC_AUTH0_DOMAIN}/oidc/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${returnUrl}`;
    router.push(logOutUrl);
  };

  if (userState.auth?.isAuthenticated) {
    return (
      <Menu>
        <Menu.Trigger data-test-id="logged-in-menu-button">{userState.profile?.name}</Menu.Trigger>
        <Menu.Items>
          <Menu.Link data-test-id="profile-link" href="/user">
            {t('common:labels.user')}
          </Menu.Link>
          <Menu.Link href="/user/account">{t('common:labels.account')}</Menu.Link>
          {userState.roles?.includes('Admin') && (
            <Menu.Link href="/admin">{t('common:labels.admin')}</Menu.Link>
          )}
          <Menu.Button onClick={handleLogout} data-test-id="logout-button">
            {t('common:labels.logout')}
          </Menu.Button>
        </Menu.Items>
      </Menu>
    );
  }

  return (
    <Button
      onClick={handleLogin}
      variant="primary"
      bgDark={props.bgDark}
      data-test-id="login-button"
    >
      {t('common:labels.login')}
    </Button>
  );
};

export default UserMenu;

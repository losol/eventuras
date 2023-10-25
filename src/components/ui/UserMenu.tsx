'use client';

import { useRouter } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import { useContext } from 'react';

import Button from '@/components/ui/Button';
import Link from '@/components/ui/Link';
import { UserContext } from '@/context';
import Environment from '@/utils/Environment';

interface UserMenuProps {
  bgDark?: boolean;
}

const UserMenu = (props: UserMenuProps) => {
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

  return (
    <div className="flex items-center">
      {userState.auth?.isAuthenticated && (
        <Link href="/user" bgDark={props.bgDark} className="font-bold mr-2">
          Profile
        </Link>
      )}
      {!userState.auth?.isAuthenticated && (
        <Button variant="transparent" onClick={handleLogin} bgDark={props.bgDark}>
          Log in
        </Button>
      )}
      {userState.auth?.isAuthenticated && (
        <Button variant="transparent" onClick={handleLogout} bgDark={props.bgDark}>
          Log out
        </Button>
      )}
    </div>
  );
};

export default UserMenu;

'use client';

import { useRouter } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import { useContext } from 'react';

import { Button } from '@/components/inputs';
import Link from '@/components/inputs/Link';
import { UserContext } from '@/context';
import Environment from '@/utils/Environment';

interface UserMenuProps {
  lightText?: boolean;
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
        <Link href="/user" lightText={props.lightText} className="font-bold mr-2">
          Profile
        </Link>
      )}
      {!userState.auth?.isAuthenticated && (
        <Button variant="transparent" onClick={handleLogin} lightText={props.lightText}>
          Log in
        </Button>
      )}
      {userState.auth?.isAuthenticated && (
        <Button variant="transparent" onClick={handleLogout} lightText={props.lightText}>
          Log out
        </Button>
      )}
    </div>
  );
};

export default UserMenu;

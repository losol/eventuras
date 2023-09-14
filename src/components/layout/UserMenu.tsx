'use client';

import { useRouter } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import { useContext } from 'react';

import { BlockLink, Button } from '@/components/inputs';
import { UserContext } from '@/context';
import Environment from '@/utils/Environment';

const UserMenu = () => {
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
    <div className="flex items-end">
      {userState.auth?.isAuthenticated && (
        <BlockLink href="/user" className="mr-4">
          My Profile
        </BlockLink>
      )}
      {!userState.auth?.isAuthenticated && <Button onClick={handleLogin}>Log in</Button>}
      {userState.auth?.isAuthenticated && <Button onClick={handleLogout}>Log out</Button>}
    </div>
  );
};

export default UserMenu;

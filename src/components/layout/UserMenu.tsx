'use client';

import { signIn, signOut } from 'next-auth/react';
import React, { useContext } from 'react';

import { BlockLink, Button } from '@/components/inputs';
import { UserContext } from '@/context';

const UserMenu = () => {
  const { fetchUserProfile, userState } = useContext(UserContext);

  const handleLogin = async () => {
    await signIn('auth0');
    fetchUserProfile();
  };

  const handleLogout = async () => {
    await signOut();
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

'use client';

import { signIn, signOut } from 'next-auth/react';
import React, { useContext } from 'react';

import { Button } from '@/components/inputs';
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
    <>
      {!userState.auth?.isAuthenticated && <Button onClick={handleLogin}>Log in</Button>}
      {userState.auth?.isAuthenticated && <Button onClick={handleLogout}>Log out</Button>}
    </>
  );
};

export default UserMenu;

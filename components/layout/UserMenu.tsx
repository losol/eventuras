'use client';

import { Spinner } from 'components/feedback';
import { Button } from 'components/inputs';
import { signIn, signOut, useSession } from 'next-auth/react';

const UserMenu = () => {
  const { status } = useSession();

  return (
    <>
      {status === 'unauthenticated' && <Button onClick={() => signIn('auth0')}>Log in</Button>}
      {status === 'authenticated' && <Button onClick={() => signOut()}>Log out</Button>}
      {status === 'loading' && (
        <Button className="cursor-not-allowed" disabled={true}>
          <Spinner />
        </Button>
      )}
    </>
  );
};

export default UserMenu;

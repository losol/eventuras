'use client';

import { UserMenu } from 'components/layout';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

const Header = () => {
  const { data: session } = useSession();

  const userName = session?.user?.name ?? '';

  function handleSignIn() {
    signIn('auth0');
  }

  return (
    <header className="bg-gray-200 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        <Link href="/" className="flex items-center">
          <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
            {siteConfig.name}
          </span>
        </Link>
        <nav>
          {session ? <UserMenu signOut={signOut} name={userName} /> : null}
          {session ? null : (
            <Button variant="outline" onClick={handleSignIn}>
              Login
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

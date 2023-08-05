import { Button } from 'components/inputs';
import { UserMenu } from 'components/layout';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import useTranslation from 'next-translate/useTranslation';

const Header = () => {
  const { data: session } = useSession();
  const { t } = useTranslation('common');

  return (
    <nav className="bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link href="/" className="flex items-center">
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            Eventuras
          </span>
        </Link>
        <div>
          {!session && <Button onClick={() => signIn('auth0')}>{t('header.auth.login')}</Button>}
          {session && <UserMenu signOut={signOut} name={session.user?.name ?? ''} />}
        </div>
      </div>
    </nav>
  );
};

export default Header;

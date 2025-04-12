'use client';
import { useRouter } from 'next/navigation';

import UserMenuContent, { LoggedOutLanguagePack, LogginInLanguagePack } from './UserMenuContent';

interface UserMenuProps {
  loggedInContent: LogginInLanguagePack;
  LoggedOutContent: LoggedOutLanguagePack;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userName?: string;
}
export const UserMenu = (props: UserMenuProps) => {
  const router = useRouter();

  const handleLogin = async () => {
    router.push('/api/login');
  };

  if (props.isLoggedIn) {
    return (
      <UserMenuContent.LoggedIn
        isAdmin={props.isAdmin ?? false}
        menuLabel={props.userName ?? ''}
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

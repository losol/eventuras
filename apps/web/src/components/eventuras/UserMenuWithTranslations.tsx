'use client';

import UserMenu, {
  type LoggedOutLanguagePack,
  type LogginInLanguagePack,
} from './UserMenu';

interface UserMenuWithTranslationsProps {
  loggedInContent: LogginInLanguagePack;
  loggedOutContent: LoggedOutLanguagePack;
}

/**
 * Client wrapper for UserMenu that accepts translations from server component.
 * This allows the parent layout to fetch translations once and pass them down.
 */
export default function UserMenuWithTranslations(props: UserMenuWithTranslationsProps) {
  return <UserMenu loggedInContent={props.loggedInContent} LoggedOutContent={props.loggedOutContent} />;
}

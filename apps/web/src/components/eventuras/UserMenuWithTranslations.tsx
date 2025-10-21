'use client';

import UserMenu, { type UserMenuTranslations } from './UserMenu';

interface UserMenuWithTranslationsProps {
  translations: UserMenuTranslations;
}

/**
 * Client wrapper for UserMenu that accepts translations from server component.
 * This allows the parent layout to fetch translations once and pass them down.
 */
export default function UserMenuWithTranslations({ translations }: UserMenuWithTranslationsProps) {
  return <UserMenu translations={translations} />;
}

'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

type UserDetailsContextValue = {
  /** The user shown in the drawer, or null when it is closed. */
  userId: string | null;
  open: (userId: string) => void;
  close: () => void;
};

const UserDetailsContext = createContext<UserDetailsContextValue | null>(null);

/** Which user the admin user drawer shows, so any name in admin can open it. */
export function UserDetailsProvider({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const [opened, setOpened] = useState<{ userId: string; at: string } | null>(null);
  // Leaving the page closes it for good, so going Back doesn't reopen it.
  if (opened && opened.at !== pathname) setOpened(null);
  const userId = opened?.at === pathname ? opened.userId : null;
  const open = useCallback((id: string) => setOpened({ userId: id, at: pathname }), [pathname]);
  const close = useCallback(() => setOpened(null), []);
  const value = useMemo(() => ({ userId, open, close }), [userId, open, close]);
  return <UserDetailsContext.Provider value={value}>{children}</UserDetailsContext.Provider>;
}

/** Null outside the admin shell, where there is no drawer to open. */
export function useUserDetails(): UserDetailsContextValue | null {
  return useContext(UserDetailsContext);
}

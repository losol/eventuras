import type { ReactNode } from 'react';

/**
 * User layout that wraps all user pages.
 * User pages require authentication and must be rendered dynamically.
 */

// Force dynamic rendering for all user pages (they require authentication)
export const dynamic = 'force-dynamic';

export default function UserLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

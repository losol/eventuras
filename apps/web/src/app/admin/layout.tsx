import type { ReactNode } from 'react';

/**
 * Admin layout that wraps all admin pages.
 * This layout can be customized to add admin-specific UI elements,
 * different styling, or admin navigation.
 *
 * All admin pages require authentication and must be rendered dynamically.
 */

// Force dynamic rendering for all admin pages (they require authentication)
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-layout">
      {/* Future: Add admin-specific navigation, breadcrumbs, or sidebar here */}
      {children}
    </div>
  );
}

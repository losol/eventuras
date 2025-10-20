import type { ReactNode } from 'react';

/**
 * Admin layout that wraps all admin pages.
 * This layout can be customized to add admin-specific UI elements,
 * different styling, or admin navigation.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-layout">
      {/* Future: Add admin-specific navigation, breadcrumbs, or sidebar here */}
      {children}
    </div>
  );
}

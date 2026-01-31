import { redirect } from 'next/navigation';

import { getCurrentSession } from '@eventuras/fides-auth-next/session';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Unauthorized } from '@eventuras/ratio-ui/blocks/Unauthorized';

import { oauthConfig } from '@/utils/config';
import { AdminNavbar } from '@/components/AdminNavbar';

export const dynamic = 'force-dynamic';

const ADMIN_ROLES = ['system_admin', 'admin_reader'];

type SessionData = {
  systemRole?: string;
};

type UserWithRole = {
  name?: string;
  email?: string;
  roles?: string[];
  systemRole?: string;
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession(oauthConfig);

  // Not logged in - redirect to login
  if (!session?.user) {
    redirect('/api/login');
  }

  // Extract systemRole from session data
  const sessionData = session.data as SessionData | undefined;
  const systemRole = sessionData?.systemRole;

  // Build user object with systemRole for components
  const user: UserWithRole = {
    ...session.user,
    systemRole,
  };

  // Check for admin role
  const isAdmin = systemRole && ADMIN_ROLES.includes(systemRole);

  if (!isAdmin) {
    return (
      <>
        <AdminNavbar user={user} />
        <Container className="py-8">
          <Unauthorized />
        </Container>
      </>
    );
  }

  return (
    <>
      <AdminNavbar user={user} />
      <main id="main-content">
        <Container className="py-8">{children}</Container>
      </main>
    </>
  );
}

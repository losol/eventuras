import Link from 'next/link';

import { Navbar } from '@eventuras/ratio-ui/core/Navbar';

import { UserMenu } from './UserMenu';

type User = {
  name?: string;
  email?: string;
  systemRole?: string;
};

type AdminNavbarProps = {
  user?: User;
};

export function AdminNavbar({ user }: AdminNavbarProps) {
  return (
    <Navbar
      title="Idem Admin"
      titleHref="/admin"
      bgColor="bg-primary-700"
      bgDark
      sticky
      LinkComponent={Link}
    >
      <UserMenu user={user} />
    </Navbar>
  );
}

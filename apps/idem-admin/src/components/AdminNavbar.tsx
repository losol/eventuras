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

export function AdminNavbar({ user }: Readonly<AdminNavbarProps>) {
  return (
    <Navbar bgColor="bg-primary-700" className="surface-dark" sticky>
      <Navbar.Brand>
        <Link href="/admin" className="text-lg tracking-tight whitespace-nowrap no-underline">
          Idem Admin
        </Link>
      </Navbar.Brand>
      <Navbar.Content className="justify-end">
        <UserMenu user={user} />
      </Navbar.Content>
    </Navbar>
  );
}

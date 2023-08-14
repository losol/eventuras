import { EventDto, EventsService, UserDto, UsersService } from '@losol/eventuras';
import { Heading } from 'components/content';
import { Layout } from 'components/layout';
import Link from 'next/link';

import AdminEventList from './AdminEventList';
import UserList from './UserList';

const ORGANIZATION_ID: number = parseInt(process.env.NEXT_PUBLIC_ORGANIZATION_ID as string) ?? 1;
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  let eventinfo: EventDto[] = [];
  try {
    const response = await EventsService.getV3Events({
      organizationId: ORGANIZATION_ID,
    });
    eventinfo = response.data ?? [];
  } catch (error) {
    console.error('Error fetching events:', error);
  }

  let users: UserDto[] = [];
  try {
    const response = await UsersService.getV3Users1({});
    users = response.data ?? [];
  } catch (error) {
    console.error('Error fetching users:', error);
  }

  return (
    <>
      <Layout>
        <Heading as="h1">Admin</Heading>

        <div className="inline-flex flex-col">
          <Link href="/admin/users">Users</Link>
        </div>

        <Heading as="h2">Arrangement</Heading>
        <AdminEventList eventinfo={eventinfo} />
        <UserList users={users} />
      </Layout>
    </>
  );
}

import { EventDto, EventsService, UserDto, UsersService } from '@losol/eventuras';
import Link from 'next/link';

import { Heading } from '@/components/content';
import { Layout } from '@/components/layout';
import Logger from '@/utils/Logger';

import AdminEventList from './AdminEventList';
import UserList from './UserList';

const ORGANIZATION_ID: number = parseInt(process.env.NEXT_PUBLIC_ORGANIZATION_ID as string) ?? 1;
export const dynamic = 'force-dynamic';
const l = { namespace: 'adminpage' };

export default async function AdminPage() {
  let eventinfo: EventDto[] = [];
  try {
    const response = await EventsService.getV3Events({
      organizationId: ORGANIZATION_ID,
    });
    eventinfo = response.data ?? [];
  } catch (error) {
    Logger.error(l, 'Error fetching events:', error);
  }

  let users: UserDto[] = [];
  try {
    const response = await UsersService.getV3Users1({});
    users = response.data ?? [];
  } catch (error) {
    Logger.error(l, 'Error fetching events:', error);
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

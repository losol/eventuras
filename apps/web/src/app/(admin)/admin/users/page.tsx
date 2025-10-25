import { getTranslations } from 'next-intl/server';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';

import { appConfig } from '@/config.server';
import { UserDto } from '@/lib/eventuras-sdk';
import { getV3Users } from '@/lib/eventuras-sdk';

import UserList from './UserList';
import UsersActionMenu from './UsersActionMenu';
const AdminUserPage = async () => {
  const t = await getTranslations();
  // Get organization ID with proper type handling
  const organizationId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;
  const orgId =
    typeof organizationId === 'number' ? organizationId : parseInt(organizationId as string, 10);
  const response = await getV3Users({
    headers: {
      'Eventuras-Org-Id': orgId,
    },
  });
  const data: UserDto[] = response.data?.data ?? [];
  return (
    <Container>
      <Heading as="h1">{t('admin.users.page.title')}</Heading>
      <UsersActionMenu />
      <UserList users={data} />
    </Container>
  );
};

export default AdminUserPage;

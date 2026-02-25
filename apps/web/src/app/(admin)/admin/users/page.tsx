import { getTranslations } from 'next-intl/server';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';

import { UserDto } from '@/lib/eventuras-sdk';
import { getV3Users } from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';

import UserList from './UserList';
import UsersActionMenu from './UsersActionMenu';
const AdminUserPage = async () => {
  const t = await getTranslations();
  const orgId = getOrganizationId();
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

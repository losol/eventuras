import { UserDto } from '@eventuras/event-sdk';
import { Container, Heading } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/eventuras/Wrapper';
import { getV3Users } from '@eventuras/event-sdk';
import withAuthorization from '@/utils/auth/withAuthorization';
import { appConfig } from '@/config.server';

import UserList from './UserList';
import UsersActionMenu from './UsersActionMenu';

const AdminUserPage = async () => {
  const t = await getTranslations();

  // Get organization ID with proper type handling
  const organizationId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;
  const orgId = typeof organizationId === 'number'
    ? organizationId
    : parseInt(organizationId as string, 10);

  const response = await getV3Users({
    headers: {
      'Eventuras-Org-Id': orgId,
    },
  });

  const data: UserDto[] = response.data?.data ?? [];

  return (
    <Wrapper>
      <Container>
        <Heading as="h1">{t('admin.users.page.title')}</Heading>
        <UsersActionMenu />
        <UserList users={data} />
      </Container>
    </Wrapper>
  );
};

export default withAuthorization(AdminUserPage, 'Admin');

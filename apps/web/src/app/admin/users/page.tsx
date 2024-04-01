import { UserDto } from '@eventuras/sdk';
import { Container } from '@eventuras/ui';
import Heading from '@eventuras/ui/Heading';
import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import withAuthorization from '@/utils/auth/withAuthorization';
import Environment from '@/utils/Environment';

import UserList from './UserList';
import UsersActionMenu from './UsersActionMenu';

const AdminUserPage = async () => {
  const { t } = createTranslation();
  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: headers().get('Authorization'),
  });
  const userFetchResult = await apiWrapper(() =>
    eventuras.users.getV3Users1({
      eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10),
    })
  );
  let data: UserDto[] = [];
  if (userFetchResult.ok) {
    data = userFetchResult.value?.data ?? [];
  }
  return (
    <Wrapper>
      <Container>
        <Heading as="h1">{t('admin:users.page.title')}</Heading>
        <UsersActionMenu />
        <UserList users={data} />
      </Container>
    </Wrapper>
  );
};

export default withAuthorization(AdminUserPage, 'Admin');

import { Container, Heading } from '@eventuras/ui';
import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createEnrollmentsSDK } from '@/utils/api/EventurasApi';
import withAuthorization from '@/utils/auth/withAuthorization';
import Environment from '@/utils/Environment';

import UserList from './UserList';
import UsersActionMenu from './UsersActionMenu';
import { UserDto } from 'enrollments-sdk/models/components/userdto';
import { UserDtoPageResponseDto } from 'enrollments-sdk/models/components';

const AdminUserPage = async () => {
  const { t } = createTranslation();
  const enrollmentSdk = createEnrollmentsSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: headers().get('Authorization'),
  });
  /**
   * TODO - in case of the apiWrapper, whilst it does play nicely with the new enrollment sdk, it does beg the question of it makes optimal use of the new sdk
   */
  const userFetchResult = await apiWrapper(() =>
    enrollmentSdk.users.getV3Users({
      eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10),
    })
  );
  let data: UserDto[] = [];

  if (userFetchResult.ok) {
    data = (userFetchResult.value as UserDtoPageResponseDto).data!
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

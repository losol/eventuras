import { UserDto, UserDtoPageResponseDto } from '@eventuras/sdk';
import { Container, Heading } from '@eventuras/ui';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import withAuthorization from '@/utils/auth/withAuthorization';
import Environment from '@/utils/Environment';
import { getAccessToken } from '@/utils/getAccesstoken';
import { oauthConfig } from '@/utils/oauthConfig';

import UserList from './UserList';
import UsersActionMenu from './UsersActionMenu';

const AdminUserPage = async () => {
  const t = await getTranslations();
  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: await getAccessToken(),
  });
  /**
   * TODO - in case of the apiWrapper, whilst it does play nicely with the new enrollment sdk, it does beg the question of it makes optimal use of the new sdk
   */
  const userFetchResult = await apiWrapper(() =>
    eventuras.users.getV3Users1({
      eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10),
    })
  );
  let data: UserDto[] = [];

  if (userFetchResult.ok) {
    data = (userFetchResult.value as UserDtoPageResponseDto).data!;
  }
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

import { UserDto, UserDtoPageResponseDto } from '@eventuras/sdk';
import { Container, Heading } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import withAuthorization from '@/utils/auth/withAuthorization';
import { appConfig } from '@/config.server';
import { getAccessToken } from '@/utils/getAccesstoken';

import UserList from './UserList';
import UsersActionMenu from './UsersActionMenu';

const AdminUserPage = async () => {
  const t = await getTranslations();
  const eventuras = createSDK({
    baseUrl: appConfig.env.NEXT_PUBLIC_BACKEND_URL as string,
    authHeader: await getAccessToken(),
  });
  const userFetchResult = await apiWrapper(() =>
    eventuras.users.getV3Users1({
      eventurasOrgId: parseInt(appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID as string, 10),
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

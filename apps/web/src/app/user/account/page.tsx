import { Heading } from '@eventuras/ui';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { getAccessToken } from '@/utils/getAccesstoken';

import UserEditor from '../../admin/users/UserEditor';

const UserAccountPage = async () => {
  const eventuras = createSDK({ authHeader: await getAccessToken() });
  const t = await getTranslations();

  const result = await apiWrapper(() => eventuras.users.getV3UsersMe({}));
  if (!result.ok || !result.value) {
    return <Wrapper>{t('user.page.profileNotFound')}</Wrapper>;
  }

  return (
    <Wrapper>
      <Heading>{t('user.profile.page.heading')}</Heading>
      <UserEditor user={result.value} />
    </Wrapper>
  );
};

export default UserAccountPage;

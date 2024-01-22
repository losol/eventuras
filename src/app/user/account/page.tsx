import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import { Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';

import UserEditor from '../../admin/users/UserEditor';

const UserAccountPage = async () => {
  const eventuras = createSDK({ authHeader: headers().get('Authorization') });
  const { t } = createTranslation();

  const result = await apiWrapper(() => eventuras.users.getV3UsersMe({}));
  if (!result.ok || !result.value) {
    return <Layout>{t('user:page.profileNotFound')}</Layout>;
  }

  return (
    <Layout>
      <Heading>{t('user:profile.page.heading')}</Heading>
      <UserEditor user={result.value} />
    </Layout>
  );
};

export default UserAccountPage;

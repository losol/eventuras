import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import { Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';

import UserEditor from '../../admin/users/UserEditor';

const UserAccountPage = async () => {
  const eventuras = createSDK({ authHeader: headers().get('Authorization') });
  const { t } = createTranslation();

  const user = await apiWrapper(() => eventuras.users.getV3UsersMe({}));
  if (!user || !user.value) return <Layout>{t('user:page.profileNotFound')}</Layout>;

  return (
    <Layout>
      <Heading>{t('user:profile.page.heading')}</Heading>
      <UserEditor user={user.value} />
    </Layout>
  );
};

export default UserAccountPage;

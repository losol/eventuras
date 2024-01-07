import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import { Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';

import UserEventRegistrations from './(components)/UserEventRegistrations';
import UserProfileCard from './(components)/UserProfileCard';

const UserPage = async () => {
  const eventuras = createSDK({ authHeader: headers().get('Authorization') });
  const { t } = createTranslation();

  const profile = await apiWrapper(() => eventuras.users.getV3UsersMe({}));
  if (!profile || !profile.value) return <Layout>{t('user:page.profileNotFound')}</Layout>;

  const registrations = await apiWrapper(() =>
    eventuras.registrations.getV3Registrations({
      userId: profile.value!.id!,
      includeEventInfo: true,
      includeProducts: true,
    })
  );

  return (
    <Layout>
      <Heading>{t('user:page.heading')}</Heading>
      <UserProfileCard profile={profile.value!} />
      {registrations.value && registrations.value.count! > 0 && (
        <UserEventRegistrations registrations={registrations.value.data!} />
      )}
    </Layout>
  );
};

export default UserPage;

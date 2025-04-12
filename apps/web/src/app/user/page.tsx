import { Heading } from '@eventuras/ui';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { getAccessToken } from '@/utils/getAccesstoken';

import UserEventRegistrations from '../../components/user/UserEventRegistrations';
import UserProfileCard from '../../components/user/UserProfileCard';

const UserPage = async () => {
  const eventuras = createSDK({ authHeader: await getAccessToken() });
  const t = await getTranslations();

  const profile = await apiWrapper(() => eventuras.users.getV3UsersMe({}));
  if (!profile || !profile.value) return <>{t('user.page.profileNotFound')}</>;

  const registrations = await apiWrapper(() =>
    eventuras.registrations.getV3Registrations({
      userId: profile.value!.id!,
      includeEventInfo: true,
      includeProducts: true,
    })
  );

  return (
    <Wrapper>
      <Heading>{t('user.page.heading')}</Heading>
      <UserProfileCard profile={profile.value!} />
      {registrations.value && registrations.value.count! > 0 && (
        <UserEventRegistrations registrations={registrations.value.data!} />
      )}
    </Wrapper>
  );
};

export default UserPage;

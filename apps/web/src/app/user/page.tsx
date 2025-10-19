import { Heading } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/eventuras/Wrapper';
import { getV3UsersMe, getV3Registrations } from '@eventuras/event-sdk';

import UserEventRegistrations from '../../components/user/UserEventRegistrations';
import UserProfileCard from '../../components/user/UserProfileCard';

const UserPage = async () => {
  const t = await getTranslations();

  const profileResponse = await getV3UsersMe();
  if (!profileResponse.data) return <>{t('user.page.profileNotFound')}</>;

  const registrationsResponse = await getV3Registrations({
    query: {
      UserId: profileResponse.data.id!,
      IncludeEventInfo: true,
      IncludeProducts: true,
    },
  });

  return (
    <Wrapper>
      <Heading>{t('user.page.heading')}</Heading>
      <UserProfileCard profile={profileResponse.data} />
      {registrationsResponse.data && registrationsResponse.data.count! > 0 && (
        <UserEventRegistrations registrations={registrationsResponse.data.data!} />
      )}
    </Wrapper>
  );
};

export default UserPage;

import { getTranslations } from 'next-intl/server';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';

import UserEventRegistrations from '@/components/user/UserEventRegistrations';
import UserPrivacyChoices from '@/components/user/UserPrivacyChoices';
import UserProfileCard from '@/components/user/UserProfileCard';
import {
  getV3Registrations,
  getV3Userprofile,
  getV3UserprofilePurposes,
} from '@/lib/eventuras-sdk';

const UserPage = async () => {
  const t = await getTranslations();
  const profileResponse = await getV3Userprofile();
  if (!profileResponse.data) return <>{t('user.page.profileNotFound')}</>;
  const [registrationsResponse, purposesResponse] = await Promise.all([
    getV3Registrations({
      query: {
        UserId: profileResponse.data.id!,
        IncludeEventInfo: true,
        IncludeProducts: true,
      },
    }),
    getV3UserprofilePurposes(),
  ]);
  // Without purposes the organization has nothing to ask about, so the section is left out.
  const purposes = purposesResponse.data ?? [];
  return (
    <Container>
      <Heading>{t('user.page.heading')}</Heading>
      <UserProfileCard profile={profileResponse.data} />
      {purposes.length > 0 && <UserPrivacyChoices purposes={purposes} />}
      {registrationsResponse.data && registrationsResponse.data.count! > 0 && (
        <UserEventRegistrations registrations={registrationsResponse.data.data!} />
      )}
    </Container>
  );
};
export default UserPage;

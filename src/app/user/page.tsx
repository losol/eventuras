'use client';
import createTranslation from 'next-translate/createTranslation';
import { useContext } from 'react';

import { Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import Loading from '@/components/ui/Loading';
import { UserContext } from '@/context/UserContext';
import useCreateHook from '@/hooks/createHook';
import { createSDK } from '@/utils/api/EventurasApi';

import UserEventRegistrations from './(components)/UserEventRegistrations';
import UserProfileCard from './(components)/UserProfileCard';

const UserProfilePage = () => {
  const { profile } = useContext(UserContext).userState;
  const profileId: string | undefined = profile ? profile.id! : undefined;
  const { loading, result } = useCreateHook(
    () =>
      createSDK({
        inferUrl: { enabled: true, requiresToken: true },
      }).registrations.getV3Registrations({
        userId: profileId,
        includeEventInfo: true,
        includeProducts: true,
      }),
    [profileId]
  );

  if (!profile) return null;
  const { t } = createTranslation();

  return (
    <Layout>
      <Heading>{t('user:page.heading')}</Heading>
      <UserProfileCard profile={profile} />
      {loading && <Loading />}
      {result && result.data && result.data.length > 0 && (
        <UserEventRegistrations registrations={result.data} />
      )}
    </Layout>
  );
};

export default UserProfilePage;

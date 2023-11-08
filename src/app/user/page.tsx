'use client';
import createTranslation from 'next-translate/createTranslation';
import { useContext } from 'react';

import { Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import Loading from '@/components/ui/Loading';
import { UserContext } from '@/context/UserContext';
import { useUserEventRegistrations } from '@/hooks/apiHooks';

import UserEventRegistrations from './(components)/UserEventRegistrations';
import UserProfileCard from './(components)/UserProfileCard';

const UserProfilePage = () => {
  const { profile } = useContext(UserContext).userState;
  const { loading, userRegistrations } = useUserEventRegistrations(profile?.id);
  const { t } = createTranslation();

  if (!profile) return null;
  return (
    <Layout>
      <Heading>{t('user:page.heading')}</Heading>
      <UserProfileCard profile={profile} />
      {loading && <Loading />}
      {userRegistrations.length > 0 && <UserEventRegistrations registrations={userRegistrations} />}
    </Layout>
  );
};

export default UserProfilePage;

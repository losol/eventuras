'use client';
import { useContext } from 'react';

import { Heading } from '@/components/content';
import { Loading } from '@/components/feedback';
import { Container, Layout } from '@/components/layout';
import { UserContext } from '@/context/UserContext';
import useEventRegistrations from '@/hooks/useEventRegistrations';

import UserEventRegistrations from './(components)/UserEventRegistrations';
import UserProfileCard from './(components)/UserProfileCard';

const UserProfilePage = () => {
  const { profile } = useContext(UserContext).userState;
  const { loading, userRegistrations } = useEventRegistrations(profile?.id);
  if (!profile) return null;
  return (
    <Layout>
      <Heading>User profile</Heading>
      <Container>
        <UserProfileCard profile={profile} />
        {loading && <Loading />}
        {userRegistrations.length > 0 && (
          <UserEventRegistrations registrations={userRegistrations} />
        )}
      </Container>
    </Layout>
  );
};

export default UserProfilePage;

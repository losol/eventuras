import { Heading } from '@/components/content';
import { Container, Layout } from '@/components/layout';

import UserProfileCard from './(components)/UserProfile';

const UserProfilePage = () => {
  return (
    <Layout>
      <Heading>User profile</Heading>
      <Container>
        <UserProfileCard />
      </Container>
    </Layout>
  );
};

export default UserProfilePage;

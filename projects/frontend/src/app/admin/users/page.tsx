import createTranslation from 'next-translate/createTranslation';

import { Container, Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import withAuthorization from '@/utils/auth/withAuthorization';

import UsersActionMenu from './UsersActionMenu';

const AdminUserPage = async () => {
  const { t } = createTranslation();

  return (
    <Layout>
      <Container>
        <Heading as="h1">{t('admin:users.page.title')}</Heading>
        <UsersActionMenu />
      </Container>
    </Layout>
  );
};

export default withAuthorization(AdminUserPage, 'Admin');

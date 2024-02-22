import { Container, Layout } from '@eventuras/ui';
import Heading from '@eventuras/ui/Heading';
import createTranslation from 'next-translate/createTranslation';

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

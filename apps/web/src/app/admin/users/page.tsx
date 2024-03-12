import { Container } from '@eventuras/ui';
import Heading from '@eventuras/ui/Heading';
import createTranslation from 'next-translate/createTranslation';

import Wrapper from '@/components/eventuras/Wrapper';
import withAuthorization from '@/utils/auth/withAuthorization';

import UsersActionMenu from './UsersActionMenu';

const AdminUserPage = async () => {
  const { t } = createTranslation();

  return (
    <Wrapper>
      <Container>
        <Heading as="h1">{t('admin:users.page.title')}</Heading>
        <UsersActionMenu />
      </Container>
    </Wrapper>
  );
};

export default withAuthorization(AdminUserPage, 'Admin');

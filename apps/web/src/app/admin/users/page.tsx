import { Container } from '@eventuras/ui';
import Heading from '@eventuras/ui/Heading';
import createTranslation from 'next-translate/createTranslation';

import FixedContainer from '@/components/eventuras/navigation/FixedContainer';
import withAuthorization from '@/utils/auth/withAuthorization';

import UsersActionMenu from './UsersActionMenu';

const AdminUserPage = async () => {
  const { t } = createTranslation();

  return (
    <FixedContainer>
      <Container>
        <Heading as="h1">{t('admin:users.page.title')}</Heading>
        <UsersActionMenu />
      </Container>
    </FixedContainer>
  );
};

export default withAuthorization(AdminUserPage, 'Admin');

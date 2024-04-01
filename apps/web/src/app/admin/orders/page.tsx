import { Container, Heading, Section } from '@eventuras/ui';
import createTranslation from 'next-translate/createTranslation';

import Wrapper from '@/components/eventuras/Wrapper';
import withAuthorization from '@/utils/auth/withAuthorization';

import AdminOrdersList from './AdminOrdersList';

const AdminOrdersPage = async () => {
  const { t } = createTranslation();

  return (
    <Wrapper>
      <Container>
        <Heading as="h1">{t('admin:orders.page.title')}</Heading>
      </Container>
      <Section>
        <Container>
          <AdminOrdersList />
        </Container>
      </Section>
    </Wrapper>
  );
};

export default withAuthorization(AdminOrdersPage, 'Admin');

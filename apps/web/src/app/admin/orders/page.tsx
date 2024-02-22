import { Container, Layout } from '@eventuras/ui';
import Heading from '@eventuras/ui/Heading';
import Section from '@eventuras/ui/Section';
import createTranslation from 'next-translate/createTranslation';

import withAuthorization from '@/utils/auth/withAuthorization';

import AdminOrdersList from './AdminOrdersList';

const AdminOrdersPage = async () => {
  const { t } = createTranslation();

  return (
    <Layout>
      <Container>
        <Heading as="h1">{t('admin:orders.page.title')}</Heading>
      </Container>
      <Section>
        <Container>
          <AdminOrdersList />
        </Container>
      </Section>
    </Layout>
  );
};

export default withAuthorization(AdminOrdersPage, 'Admin');

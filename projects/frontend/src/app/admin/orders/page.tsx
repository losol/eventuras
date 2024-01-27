import createTranslation from 'next-translate/createTranslation';

import { Container, Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import Section from '@/components/ui/Section';
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

import { Container, Heading, Section } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/eventuras/Wrapper';
import withAuthorization from '@/utils/auth/withAuthorization';

import AdminOrdersList from './AdminOrdersList';

const AdminOrdersPage = async () => {
  const t = await getTranslations();

  return (
    <Wrapper>
      <Container>
        <Heading as="h1">{t('admin.orders.page.title')}</Heading>
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

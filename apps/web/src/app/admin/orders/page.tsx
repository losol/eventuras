import { Container } from '@eventuras/ui';
import Heading from '@eventuras/ui/Heading';
import Section from '@eventuras/ui/Section';
import createTranslation from 'next-translate/createTranslation';

import FixedContainer from '@/components/eventuras/navigation/FixedContainer';
import withAuthorization from '@/utils/auth/withAuthorization';

import AdminOrdersList from './AdminOrdersList';

const AdminOrdersPage = async () => {
  const { t } = createTranslation();

  return (
    <FixedContainer>
      <Container>
        <Heading as="h1">{t('admin:orders.page.title')}</Heading>
      </Container>
      <Section>
        <Container>
          <AdminOrdersList />
        </Container>
      </Section>
    </FixedContainer>
  );
};

export default withAuthorization(AdminOrdersPage, 'Admin');

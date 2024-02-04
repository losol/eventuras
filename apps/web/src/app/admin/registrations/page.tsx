import createTranslation from 'next-translate/createTranslation';

import { Container, Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import Section from '@/components/ui/Section';
import withAuthorization from '@/utils/auth/withAuthorization';

import AdminRegistrationsList from './AdminRegistrationsList';

const AdminRegistrationsPage = async () => {
  const { t } = createTranslation();

  return (
    <Layout fluid>
      <Section className="py-8">
        <Container>
          <Heading as="h1">{t('common:registrations.page.title')}</Heading>
        </Container>
      </Section>
      <Section>
        <Container>
          <AdminRegistrationsList />
        </Container>
      </Section>
    </Layout>
  );
};

export default withAuthorization(AdminRegistrationsPage, 'Admin');

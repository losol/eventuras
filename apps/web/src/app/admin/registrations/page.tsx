import { Container, Heading, Section } from '@eventuras/ui';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/eventuras/Wrapper';
import withAuthorization from '@/utils/auth/withAuthorization';

import AdminRegistrationsList from './AdminRegistrationsList';

const AdminRegistrationsPage = async () => {
  const t = await getTranslations();

  return (
    <Wrapper>
      <Section className="py-8">
        <Container>
          <Heading as="h1">{t('common.registrations.page.title')}</Heading>
        </Container>
      </Section>
      <Section>
        <Container>
          <AdminRegistrationsList />
        </Container>
      </Section>
    </Wrapper>
  );
};

export default withAuthorization(AdminRegistrationsPage, 'Admin');

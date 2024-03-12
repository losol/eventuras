import { Container } from '@eventuras/ui';
import Heading from '@eventuras/ui/Heading';
import Section from '@eventuras/ui/Section';
import createTranslation from 'next-translate/createTranslation';

import Wrapper from '@/components/eventuras/Wrapper';
import withAuthorization from '@/utils/auth/withAuthorization';

import AdminRegistrationsList from './AdminRegistrationsList';

const AdminRegistrationsPage = async () => {
  const { t } = createTranslation();

  return (
    <Wrapper>
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
    </Wrapper>
  );
};

export default withAuthorization(AdminRegistrationsPage, 'Admin');

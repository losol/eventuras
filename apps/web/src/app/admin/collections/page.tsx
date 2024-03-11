import { Container } from '@eventuras/ui';
import Heading from '@eventuras/ui/Heading';
import Section from '@eventuras/ui/Section';
import createTranslation from 'next-translate/createTranslation';

import withAuthorization from '@/utils/auth/withAuthorization';

import CollectionsList from './CollectionsList';

const AdminOrdersPage = async () => {
  const { t } = createTranslation();

  return (
    <>
      <Container>
        <Heading as="h1">{t('common:collections.page.title')}</Heading>
      </Container>
      <Section>
        <Container>
          <CollectionsList />
        </Container>
      </Section>
    </>
  );
};

export default withAuthorization(AdminOrdersPage, 'Admin');

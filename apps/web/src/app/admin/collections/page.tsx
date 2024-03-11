import { Container } from '@eventuras/ui';
import Heading from '@eventuras/ui/Heading';
import Section from '@eventuras/ui/Section';
import createTranslation from 'next-translate/createTranslation';

import withAuthorization from '@/utils/auth/withAuthorization';

import CollectionsList from './CollectionsList';
import FixedContainer from '@/components/eventuras/navigation/FixedContainer';

const AdminOrdersPage = async () => {
  const { t } = createTranslation();

  return (
    <FixedContainer>
      <Container>
        <Heading as="h1">{t('common:collections.page.title')}</Heading>
      </Container>
      <Section>
        <Container>
          <CollectionsList />
        </Container>
      </Section>
    </FixedContainer>
  );
};

export default withAuthorization(AdminOrdersPage, 'Admin');

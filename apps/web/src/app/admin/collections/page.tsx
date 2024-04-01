import { Container, Heading, Section } from '@eventuras/ui';
import createTranslation from 'next-translate/createTranslation';

import Wrapper from '@/components/eventuras/Wrapper';
import withAuthorization from '@/utils/auth/withAuthorization';

import CollectionCreator from './CollectionCreator';
import CollectionsList from './CollectionsList';

const AdminOrdersPage = async () => {
  const { t } = createTranslation();

  return (
    <Wrapper>
      <Container>
        <Heading as="h1">{t('common:collections.page.title')}</Heading>
        <CollectionCreator />
      </Container>
      <Section>
        <Container>
          <CollectionsList />
        </Container>
      </Section>
    </Wrapper>
  );
};

export default withAuthorization(AdminOrdersPage, 'Admin');

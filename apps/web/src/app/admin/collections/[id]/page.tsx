import { Container } from '@eventuras/ui';
import Heading from '@eventuras/ui/Heading';
import Section from '@eventuras/ui/Section';
import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';

import CollectionEditor from '../CollectionEditor';

type EventCollectionProps = {
  params: {
    id: number;
  };
};
const CollectionDetailPage: React.FC<EventCollectionProps> = async ({ params }) => {
  const eventId = params.id;

  const { t } = createTranslation();

  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: headers().get('Authorization'),
  });

  const collection = await apiWrapper(() =>
    eventuras.eventCollection.getV3Eventcollections1({
      id: eventId,
    })
  );

  if (!collection.ok) {
    Logger.error(
      { namespace: 'collections' },
      `Failed to fetch collection ${eventId}, error: ${collection.error}`
    );
  }

  if (!collection.ok) {
    return <div>{t('common:event-not-found')}</div>;
  }

  return (
    <Wrapper fluid>
      <Section className="bg-white dark:bg-black   pb-8">
        <Container>
          <Heading as="h1">{collection.value?.name ?? ''}</Heading>
        </Container>
      </Section>
      <Section className="bg-white dark:bg-black   pb-8">
        <Container>
          <CollectionEditor eventCollection={collection.value!} />
        </Container>
      </Section>
    </Wrapper>
  );
};

export default CollectionDetailPage;

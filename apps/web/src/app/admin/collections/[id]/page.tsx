import { Container, Heading, Section } from '@eventuras/ui';
import { Logger } from '@eventuras/utils';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import { getAccessToken } from '@/utils/getAccesstoken';
import { oauthConfig } from '@/utils/oauthConfig';

import CollectionEditor from '../CollectionEditor';

type EventCollectionProps = {
  params: {
    id: number;
  };
};
const CollectionDetailPage: React.FC<EventCollectionProps> = async props => {
  const params = await props.params;
  const eventId = params.id;

  const t = await getTranslations();

  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: await getAccessToken(),
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
    return <div>{t('common.event-not-found')}</div>;
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

import { Container, Heading, Section } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/utils/src/Logger';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import { getAccessToken } from '@/utils/getAccesstoken';

import CollectionEditor from '../CollectionEditor';

type EventCollectionProps = {
  params: Promise<{
    id: number;
  }>;
};

export default async function CollectionDetailPage({ params }: Readonly<EventCollectionProps>) {
  const { id } = await params;

  const t = await getTranslations();

  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: await getAccessToken(),
  });

  const collection = await apiWrapper(() =>
    eventuras.eventCollection.getV3Eventcollections1({
      id: id,
    })
  );

  if (!collection.ok) {
    Logger.error(
      { namespace: 'collections' },
      `Failed to fetch collection ${id}, error: ${collection.error}`
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
}

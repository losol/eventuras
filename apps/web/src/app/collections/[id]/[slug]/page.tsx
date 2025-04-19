import { MarkdownContent } from '@eventuras/markdown';
import { Container, Heading, Section, Text } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/utils';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import Card from '@/components/Card';
import EventCard from '@/components/event/EventCard';
import Wrapper from '@/components/eventuras/Wrapper';
import Link from '@/components/Link';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';

type EventInfoProps = {
  params: Promise<{
    id: number;
    slug: string;
  }>;
};

export const revalidate = 300;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dynamicParams = true;

export async function generateStaticParams() {
  const orgId = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID);

  Logger.info(
    { namespace: 'collections:staticparams' },
    `Api Base url: ${Environment.NEXT_PUBLIC_BACKEND_URL}, orgId: ${orgId})`
  );

  const eventuras = createSDK({ inferUrl: true });
  const collections = await eventuras.eventCollection.getV3Eventcollections({
    eventurasOrgId: orgId,
  });

  if (!collections) return [];

  if (collections.data) {
    const staticParams = collections.data.map(collection => ({
      id: collection.id?.toString(),
      slug: collection.slug,
    }));
    Logger.info({ namespace: 'collections:staticparams' }, 'Static params:', staticParams);
    return staticParams;
  }

  return [];
}

const CollectionPage: React.FC<EventInfoProps> = async props => {
  const params = await props.params;
  const t = await getTranslations();
  const eventuras = createSDK({ inferUrl: true });
  const result = await apiWrapper(() =>
    eventuras.eventCollection.getV3Eventcollections1({ id: params.id })
  );

  const notFound = !result.ok || !result.value;

  if (notFound)
    return (
      <>
        <Heading>{t('common.events.detailspage.notfound.title')}</Heading>
        <Text className="py-6">{t('common.events.detailspage.notfound.description')}</Text>
        <Link href="/" variant="button-primary">
          {t('common.events.detailspage.notfound.back')}
        </Link>
      </>
    );

  const collection = result.value!;

  if (params.slug !== collection.slug) {
    redirect(`/collections/${collection.id!}/${collection.slug!}`);
  }

  const eventinfos = await apiWrapper(() =>
    eventuras.events.getV3Events({
      collectionId: collection.id!,
    })
  );

  return (
    <Wrapper>
      {collection?.featuredImageUrl && (
        <Card
          className="mx-auto min-h-[33vh]"
          {...(collection?.featuredImageUrl && { backgroundImage: collection.featuredImageUrl })}
        ></Card>
      )}
      <Section className="py-16">
        <Container>
          <Heading as="h1" spacingClassName="pt-6 pb-3">
            {collection?.name ?? 'Mysterious Collection'}
          </Heading>
          <MarkdownContent markdown={collection.description} />
        </Container>
      </Section>
      <Section>
        {eventinfos.value?.data && eventinfos.value.data.length > 0 ? (
          <Container>
            <Heading as="h2" spacingClassName="pt-6 pb-3">
              {t('common.collections.detailspage.eventstitle')}
            </Heading>
            {eventinfos.value.data.map(eventinfo => (
              <EventCard key={eventinfo.id} eventinfo={eventinfo} />
            ))}
          </Container>
        ) : (
          <Container>
            <Text className="py-6">{t('common.labels.noevents')}</Text>
          </Container>
        )}
      </Section>
    </Wrapper>
  );
};

export default CollectionPage;

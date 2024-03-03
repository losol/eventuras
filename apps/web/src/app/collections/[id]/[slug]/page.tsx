import { Container, Layout } from '@eventuras/ui';
import Card from '@eventuras/ui/Card';
import Heading from '@eventuras/ui/Heading';
import Link from '@eventuras/ui/Link';
import Section from '@eventuras/ui/Section';
import Text from '@eventuras/ui/Text';
import { redirect } from 'next/navigation';
import createTranslation from 'next-translate/createTranslation';

import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';

type EventInfoProps = {
  params: {
    id: number;
    slug: string;
  };
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
    Logger.info({ namespace: 'events:staticparams' }, 'Static params:', staticParams);
    return staticParams;
  }

  return [];
}

const CollectionPage: React.FC<EventInfoProps> = async ({ params }) => {
  const { t } = createTranslation();
  const eventuras = createSDK({ inferUrl: true });
  const result = await apiWrapper(() =>
    eventuras.eventCollection.getV3Eventcollections1({ id: params.id })
  );

  let notFound = !result.ok || !result.value;

  if (notFound)
    return (
      <Layout>
        <Heading>{t('common:events.detailspage.notfound.title')}</Heading>
        <Text className="py-6">{t('common:events.detailspage.notfound.description')}</Text>
        <Link href="/" variant="button-primary">
          {t('common:events.detailspage.notfound.back')}
        </Link>
      </Layout>
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
    <Layout fluid>
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
          <Text text={collection.description} className="py-3" />
        </Container>
      </Section>
      <Section>
        {eventinfos.value?.data && eventinfos.value.data.length > 0 ? (
          <Container>
            <Heading as="h2" spacingClassName="pt-6 pb-3">
              {t('common:collections.detailspage.eventstitle')}
            </Heading>
            {eventinfos.value.data.map(eventinfo => (
              <Card key={eventinfo.id} className="mb-4">
                <Card.Heading as="h2">{eventinfo.title}</Card.Heading>
                <Card.Text className="pb-4">{eventinfo.description}</Card.Text>
                <Link href={`/events/${eventinfo.id}/${eventinfo.slug}`} variant="button-primary">
                  {t('common:labels.view')}
                </Link>
              </Card>
            ))}
          </Container>
        ) : (
          <Container>
            <Text className="py-6">{t('common:events.detailspage.noevents')}</Text>
          </Container>
        )}
      </Section>
    </Layout>
  );
};

export default CollectionPage;
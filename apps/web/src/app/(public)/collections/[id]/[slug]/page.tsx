import { Logger } from '@eventuras/logger';
import { MarkdownContent } from '@eventuras/markdown';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';
const logger = Logger.create({
  namespace: 'web:app:collections',
  context: { page: 'CollectionPage' },
});
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Card } from '@eventuras/ratio-ui/core/Card';
import { Link } from '@eventuras/ratio-ui-next/Link';

import EventCard from '@/components/event/EventCard';
import { appConfig } from '@/config.server';
import { getPublicClient } from '@/lib/eventuras-public-client';
import {
  getV3Eventcollections,
  getV3EventcollectionsById,
  getV3Events,
} from '@/lib/eventuras-public-sdk';
import { getOrganizationId } from '@/utils/organization';
type EventInfoProps = {
  params: Promise<{
    id: number;
    slug: string;
  }>;
};
// Incremental Static Regeneration - revalidate every 5 minutes
export const revalidate = 300;
// Allow generating new collection pages on-demand
export const dynamicParams = true;
export async function generateStaticParams() {
  const orgId = getOrganizationId();
  logger.info(
    { apiBaseUrl: appConfig.env.BACKEND_URL as string, orgId },
    'Generating static params for collections'
  );
  try {
    // Use public client for anonymous API access during static generation
    const publicClient = getPublicClient();
    const response = await getV3Eventcollections({
      client: publicClient,
      headers: {
        'Eventuras-Org-Id': orgId,
      },
    });
    if (!response.data?.data) return [];
    const staticParams = response.data.data.map(collection => ({
      id: collection.id?.toString(),
      slug: collection.slug,
    }));
    logger.info({ staticParams }, 'Generated static params');
    return staticParams;
  } catch (error) {
    logger.warn(
      { error },
      'Error generating static params for collections - this is expected during build time if backend is not running'
    );
    return [];
  }
}
const CollectionPage: React.FC<EventInfoProps> = async props => {
  const params = await props.params;
  const t = await getTranslations();
  // Use public client for anonymous API access
  const publicClient = getPublicClient();
  const response = await getV3EventcollectionsById({
    client: publicClient,
    path: { id: params.id },
  });
  if (!response.data)
    return (
      <>
        <Heading>{t('common.events.detailspage.notfound.title')}</Heading>
        <Text className="py-6">{t('common.events.detailspage.notfound.description')}</Text>
        <Link href="/" variant="button-primary">
          {t('common.events.detailspage.notfound.back')}
        </Link>
      </>
    );
  const collection = response.data;
  if (params.slug !== collection.slug) {
    redirect(`/collections/${collection.id!}/${collection.slug!}`);
  }
  const eventsResponse = await getV3Events({
    client: publicClient,
    query: {
      CollectionId: collection.id!,
    },
  });
  return (
    <>
      {collection?.featuredImageUrl && (
        <Card
          variant="wide"
          {...(collection?.featuredImageUrl && { backgroundImage: collection.featuredImageUrl })}
        ></Card>
      )}
      <Section className="py-16">
        <Container>
          <Heading as="h1" padding="pt-6 pb-3">
            {collection?.name ?? 'Mysterious Collection'}
          </Heading>
          <MarkdownContent markdown={collection.description} />
        </Container>
      </Section>
      <Section>
        {eventsResponse.data?.data && eventsResponse.data.data.length > 0 ? (
          <Container>
            <Heading as="h2" padding="pt-6 pb-3">
              {t('common.collections.detailspage.eventstitle')}
            </Heading>
            {eventsResponse.data.data.map(eventinfo => (
              <EventCard key={eventinfo.id} eventinfo={eventinfo} />
            ))}
          </Container>
        ) : (
          <Container>
            <Text className="py-6">{t('common.labels.noevents')}</Text>
          </Container>
        )}
      </Section>
    </>
  );
};
export default CollectionPage;

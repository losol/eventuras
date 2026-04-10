import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { MarkdownContent } from '@eventuras/markdown';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { CategoryGroupedEvents } from '@/components/event/CategoryGroupedEvents';
import { getPublicClient } from '@/lib/eventuras-public-client';
import { getV3EventcollectionsById, getV3Events } from '@/lib/eventuras-public-sdk';
type EventInfoProps = {
  params: Promise<{
    id: number;
    slug: string;
  }>;
};
// Always render server-side so ORGANIZATION_ID is read at request time, not build time
export const dynamic = 'force-dynamic';
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
        <Text paddingY="sm">{t('common.events.detailspage.notfound.description')}</Text>
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
      Ordering: ['Category', 'DateStart', 'Title'],
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
          <Heading as="h1" paddingTop="sm" paddingBottom="xs">
            {collection?.name ?? 'Mysterious Collection'}
          </Heading>
          <MarkdownContent markdown={collection.description} />
        </Container>
      </Section>
      <Section>
        {eventsResponse.data?.data && eventsResponse.data.data.length > 0 ? (
          <Container>
            <Heading as="h2" paddingTop="sm" paddingBottom="xs">
              {t('common.collections.detailspage.eventstitle')}
            </Heading>
            <CategoryGroupedEvents events={eventsResponse.data.data} />
          </Container>
        ) : (
          <Container>
            <Text paddingY="sm">{t('common.labels.noevents')}</Text>
          </Container>
        )}
      </Section>
    </>
  );
};
export default CollectionPage;

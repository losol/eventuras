import { getTranslations } from 'next-intl/server';

import { MarkdownContent } from '@eventuras/markdown';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { getPublicClient } from '@/lib/eventuras-public-client';
import { getV3Eventcollections } from '@/lib/eventuras-public-sdk';
import { getOrganizationId } from '@/utils/organization';
// Incremental Static Regeneration - revalidate every 5 minutes
export const revalidate = 300;
const CollectionIndexPage: React.FC = async () => {
  const t = await getTranslations();
  // Get organization ID with proper type handling
  const orgId = getOrganizationId();
  // Use public client for anonymous API access
  const publicClient = getPublicClient();
  const response = await getV3Eventcollections({
    client: publicClient,
    headers: {
      'Eventuras-Org-Id': orgId,
    },
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
  const collections = response.data;
  return (
    <>
      <Section className="py-16">
        <Heading as="h1" padding="pt-6 pb-3">
          Collections
        </Heading>
      </Section>
      <Section>
        {collections &&
          collections.data &&
          collections.data.map(collection => (
            <Card key={collection.id} className="my-4">
              <Heading as="h2">{collection.name}</Heading>
              <Text className="pb-4">
                <MarkdownContent markdown={collection.description} />
              </Text>
              <Link
                href={`/collections/${collection.id}/${collection.slug}`}
                variant="button-primary"
              >
                {t('common.labels.view')}
              </Link>
            </Card>
          ))}
      </Section>
    </>
  );
};
export default CollectionIndexPage;

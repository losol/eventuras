import { MarkdownContent } from '@eventuras/markdown';
import { Heading, Section, Text } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';

import { Card } from '@eventuras/ratio-ui/core/Card';
import Wrapper from '@/components/eventuras/Wrapper';
import { Link } from '@eventuras/ratio-ui-next/Link';
import { getV3Eventcollections } from '@eventuras/event-sdk';
import { appConfig } from '@/config.server';

const CollectionIndexPage: React.FC = async () => {
  const t = await getTranslations();

  // Get organization ID with proper type handling
  const organizationId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;
  const orgId = typeof organizationId === 'number'
    ? organizationId
    : parseInt(organizationId as string, 10);

  const response = await getV3Eventcollections({
    headers: {
      'Eventuras-Org-Id': orgId,
    },
  });

  if (!response.data)
    return (
      <Wrapper>
        <Heading>{t('common.events.detailspage.notfound.title')}</Heading>
        <Text className="py-6">{t('common.events.detailspage.notfound.description')}</Text>
        <Link href="/" variant="button-primary">
          {t('common.events.detailspage.notfound.back')}
        </Link>
      </Wrapper>
    );

  const collections = response.data;

  return (
    <Wrapper>
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
    </Wrapper>
  );
};

export default CollectionIndexPage;

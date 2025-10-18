import { MarkdownContent } from '@eventuras/markdown';
import { Heading, Section, Text } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';

import { Card } from '@eventuras/ratio-ui/core/Card';
import Wrapper from '@/components/eventuras/Wrapper';
import { Link } from '@eventuras/ratio-ui-next/Link';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { publicEnv } from '@/config.client';

const CollectionIndexPage: React.FC = async () => {
  const t = await getTranslations();
  const result = await apiWrapper(() =>
    createSDK({ inferUrl: true }).eventCollection.getV3Eventcollections({
  eventurasOrgId: parseInt(String(publicEnv.NEXT_PUBLIC_ORGANIZATION_ID) || '0'),
    })
  );

  const notFound = !result.ok || !result.value;

  if (notFound)
    return (
      <Wrapper>
        <Heading>{t('common.events.detailspage.notfound.title')}</Heading>
        <Text className="py-6">{t('common.events.detailspage.notfound.description')}</Text>
        <Link href="/" variant="button-primary">
          {t('common.events.detailspage.notfound.back')}
        </Link>
      </Wrapper>
    );

  const collections = result.value!;

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

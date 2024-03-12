import Card from '@eventuras/ui/Card';
import Heading from '@eventuras/ui/Heading';
import Link from '@eventuras/ui/Link';
import Section from '@eventuras/ui/Section';
import Text from '@eventuras/ui/Text';
import createTranslation from 'next-translate/createTranslation';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';

const CollectionIndexPage: React.FC = async () => {
  const { t } = createTranslation();
  const result = await apiWrapper(() =>
    createSDK({ inferUrl: true }).eventCollection.getV3Eventcollections({
      eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID),
    })
  );

  const notFound = !result.ok || !result.value;

  if (notFound)
    return (
      <Wrapper>
        <Heading>{t('common:events.detailspage.notfound.title')}</Heading>
        <Text className="py-6">{t('common:events.detailspage.notfound.description')}</Text>
        <Link href="/" variant="button-primary">
          {t('common:events.detailspage.notfound.back')}
        </Link>
      </Wrapper>
    );

  const collections = result.value!;

  return (
    <Wrapper>
      <Section className="py-16">
        <Heading as="h1" spacingClassName="pt-6 pb-3">
          Collections
        </Heading>
      </Section>
      <Section>
        {collections &&
          collections.data &&
          collections.data.map(collection => (
            <Card key={collection.id} className="mb-4">
              <Card.Heading as="h2">{collection.name}</Card.Heading>
              <Card.Text className="pb-4">{collection.description}</Card.Text>
              <Link
                href={`/collections/${collection.id}/${collection.slug}`}
                variant="button-primary"
              >
                {t('common:labels.view')}
              </Link>
            </Card>
          ))}
      </Section>
    </Wrapper>
  );
};

export default CollectionIndexPage;

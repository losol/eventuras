import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import { Container, Layout } from '@/components/ui';
import Badge from '@/components/ui/Badge';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import Section from '@/components/ui/Section';
import { createSDK } from '@/utils/api/EventurasApi';

type EventProductsPage = {
  params: {
    id: string;
  };
};

const EventProducts: React.FC<EventProductsPage> = async ({ params }) => {
  const eventId = parseInt(params.id, 10);
  const { t } = createTranslation();

  const eventuras = createSDK({ authHeader: headers().get('Authorization') });

  const eventInfo = await eventuras.events.getV3Events1({ id: eventId });
  const products = await eventuras.eventProducts.getV3EventsProducts({ eventId });

  return (
    <Layout fluid>
      <Section className="bg-white dark:bg-black py-10">
        <Container>
          <Heading as="h1" spacingClassName="pt-6 mb-3">
            {t('admin:products.labels.productsFor')} {eventInfo.title}
          </Heading>
          <Link
            href={`/admin/events/${eventId}/products/edit`}
            variant="button-primary"
            margin="my-5"
          >
            {t('admin:products.labels.editProducts')}
          </Link>
        </Container>
      </Section>
      <Section className="py-10">
        <Container>
          <div className="flex flex-col">
            {products.map(product => (
              <Link
                href={`/admin/events/${eventId}/products/${product.productId}`}
                key={product.productId}
              >
                {product.name} <Badge>Id: {product.productId}</Badge>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </Layout>
  );
};

export default EventProducts;

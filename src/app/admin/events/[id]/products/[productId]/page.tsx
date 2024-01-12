import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import { Container, Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import Section from '@/components/ui/Section';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';

type EventProductsPage = {
  params: {
    id: string;
    productId: string;
  };
};

const EventProducts: React.FC<EventProductsPage> = async ({ params }) => {
  const eventId = parseInt(params.id);
  const productId = parseInt(params.productId);
  const { t } = createTranslation();

  const eventuras = createSDK({ authHeader: headers().get('Authorization') });
  const productSummary = await apiWrapper(() =>
    eventuras.products.getV3ProductsSummary({
      productId: productId,
      eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID),
    })
  );

  return (
    <Layout fluid>
      <Section className="bg-white dark:bg-black py-10">
        <Container>
          <Heading as="h1" spacingClassName="pt-6 mb-3">
            {productSummary.value?.product?.name}
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
            {productSummary.value?.orderSummary &&
            productSummary.value?.orderSummary?.length > 0 ? (
              <ul>
                {productSummary.value?.orderSummary?.map(entry => (
                  <li key={entry.registrationId}>
                    {entry.user?.name} - {entry.user?.phoneNumber} - {entry.user?.email}
                  </li>
                ))}
              </ul>
            ) : (
              <div>{t('admin:products.labels.noOrders')}</div>
            )}
          </div>
        </Container>
      </Section>
    </Layout>
  );
};

export default EventProducts;

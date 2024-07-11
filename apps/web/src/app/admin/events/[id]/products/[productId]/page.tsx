import { Container, Heading, Section, Text } from '@eventuras/ui';
import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import Link from '@/components/Link';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';

import DeliverySummary from '../DeliverySummary';

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

  const byRegistrationStatus = productSummary.value?.statistics?.byRegistrationStatus;
  const totals = {
    active:
      (byRegistrationStatus?.draft ?? 0) +
      (byRegistrationStatus?.verified ?? 0) +
      (byRegistrationStatus?.waitingList ?? 0) +
      (byRegistrationStatus?.attended ?? 0) +
      (byRegistrationStatus?.notAttended ?? 0) +
      (byRegistrationStatus?.finished ?? 0),
    cancelled: byRegistrationStatus?.cancelled ?? 0,
    waitingList: byRegistrationStatus?.waitingList ?? 0,
  };

  return (
    <>
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
          <Text className="py-3">
            Active {totals.active} &mdash; Cancelled {totals.cancelled} &mdash; Waiting list{' '}
            {totals.waitingList}.
          </Text>
        </Container>
      </Section>
      <Section className="py-10">
        <Container>
          <div className="flex flex-col">
            <DeliverySummary deliverySummary={productSummary.value?.orderSummary ?? []} />
          </div>
        </Container>
      </Section>
    </>
  );
};

export default EventProducts;

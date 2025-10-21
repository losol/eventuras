import { Container, Heading, Section, Text } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Logger } from '@eventuras/logger';

import { Link } from '@eventuras/ratio-ui-next/Link';
import { getV3ProductsByProductIdSummary } from '@eventuras/event-sdk';
import { appConfig } from '@/config.server';

import DeliverySummary from '../DeliverySummary';

const logger = Logger.create({
  namespace: 'web:admin:products',
  context: { page: 'ProductSummaryPage' },
});

type EventProductsPage = {
  params: Promise<{
    id: string;
    productId: string;
  }>;
};

const EventProducts: React.FC<EventProductsPage> = async props => {
  const params = await props.params;
  const eventId = parseInt(params.id);
  const productId = parseInt(params.productId);
  const t = await getTranslations();

  // Get organization ID
  const orgIdStr = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;
  const organizationId = typeof orgIdStr === 'number' ? orgIdStr : parseInt(orgIdStr as string, 10);

  logger.info({ productId, organizationId }, 'Fetching product summary');

  const response = await getV3ProductsByProductIdSummary({
    path: { productId },
    headers: {
      'Eventuras-Org-Id': organizationId,
    },
  });

  if (!response.data) {
    logger.error({ productId, error: response.error }, 'Product summary not found');
    notFound();
  }

  const productSummary = response.data;
  const byRegistrationStatus = productSummary.statistics?.byRegistrationStatus;
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
          <Heading as="h1" padding="pt-6 mb-3">
            {productSummary.product?.name}
          </Heading>
          <Link
            href={`/admin/events/${eventId}/products/edit`}
            variant="button-primary"
            margin="my-5"
          >
            {t('admin.products.labels.editProducts')}
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
            <DeliverySummary deliverySummary={productSummary.orderSummary ?? []} />
          </div>
        </Container>
      </Section>
    </>
  );
};

export default EventProducts;

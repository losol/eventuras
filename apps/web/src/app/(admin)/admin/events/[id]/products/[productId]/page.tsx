import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Logger } from '@eventuras/logger';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { ChevronRight } from '@eventuras/ratio-ui/icons';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { getV3EventsById, getV3ProductsByProductIdSummary } from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';

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
  const organizationId = getOrganizationId();

  logger.info({ productId, organizationId }, 'Fetching product summary');

  // Fetch both event and product data
  const [eventResponse, productResponse] = await Promise.all([
    getV3EventsById({ path: { id: eventId } }),
    getV3ProductsByProductIdSummary({
      path: { productId },
      headers: {
        'Eventuras-Org-Id': organizationId,
      },
    }),
  ]);

  if (!productResponse.data) {
    logger.error({ productId, error: productResponse.error }, 'Product summary not found');
    notFound();
  }

  const productSummary = productResponse.data;
  const event = eventResponse.data;
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
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm mb-4" aria-label="Breadcrumb">
            <Link href="/admin/events" className="hover:underline">
              Events
            </Link>
            <ChevronRight className="w-4 h-4" />
            {event && (
              <>
                <Link href={`/admin/events/${eventId}`} className="hover:underline">
                  {event.title}
                </Link>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            <Link href={`/admin/events/${eventId}?tab=products`} className="hover:underline">
              Products
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-600">{productSummary.product?.name}</span>
          </nav>

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

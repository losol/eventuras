import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Logger } from '@eventuras/logger';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { ChevronRight } from '@eventuras/ratio-ui/icons';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { eventAdminHref, PinEvent } from '@/components/admin/shell';
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
  const eventId = Number.parseInt(params.id);
  const productId = Number.parseInt(params.productId);
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
  return (
    <>
      <Section className="py-10">
        <Container>
          {event && (
            <PinEvent event={{ id: eventId, title: event.title ?? '', uuid: event.uuid }} />
          )}
          <nav className="flex items-center gap-2 text-sm mb-4" aria-label="Breadcrumb">
            <Link href="/admin/events" className="hover:underline">
              {t('admin.nav.events')}
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
            <Link href={eventAdminHref(eventId, 'products')} className="hover:underline">
              {t('admin.participantColumns.products')}
            </Link>
            <ChevronRight className="w-4 h-4" />
            {/* Theme token, not a fixed gray: this page renders in every theme. */}
            <span className="text-(--text-muted)">{productSummary.product?.name}</span>
          </nav>

          <Heading as="h1" paddingTop="sm" marginBottom="xs">
            {productSummary.product?.name}
          </Heading>
          <Link href={eventAdminHref(eventId, 'products')} variant="button-primary" marginY="sm">
            {t('admin.products.labels.editProducts')}
          </Link>
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

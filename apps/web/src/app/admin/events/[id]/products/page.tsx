import { Container, Heading, Section } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Logger } from '@eventuras/logger';

import Wrapper from '@/components/eventuras/Wrapper';
import { getV3EventsById, getV3EventsByEventIdProducts } from '@eventuras/event-sdk';

import EventProductsEditor from './EventProductsEditor';

const logger = Logger.create({
  namespace: 'web:admin',
  context: { page: 'EventProductsPage' }
});

type EventProductsPage = {
  params: Promise<{
    id: string;
  }>;
};

const EventProducts: React.FC<EventProductsPage> = async props => {
  const params = await props.params;
  const eventId = parseInt(params.id, 10);
  const t = await getTranslations();

  const [eventInfoRes, productsRes] = await Promise.all([
    getV3EventsById({ path: { id: eventId } }),
    getV3EventsByEventIdProducts({ path: { eventId } }),
  ]);

  const eventInfo = eventInfoRes.data;
  const products = productsRes.data;

  if (!eventInfo) {
    logger.error({ eventId, error: eventInfoRes.error }, `Event ${eventId} not found`);
    notFound();
  }

  if (productsRes.error) {
    logger.warn({ error: productsRes.error }, 'products call failed');
  }

  return (
    <Wrapper fluid>
      <Section className="bg-white dark:bg-black py-10">
        <Container>
          <Heading as="h1" padding="pt-6 mb-3">
            {t('admin.products.labels.productsFor')} {eventInfo.title}
          </Heading>
        </Container>
      </Section>
      <Section className="py-10">
        <Container>
          <EventProductsEditor eventInfo={eventInfo} products={products ?? []} />
        </Container>
      </Section>
    </Wrapper>
  );
};

export default EventProducts;

import { Container, Heading, Section } from '@eventuras/ui';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/eventuras/Wrapper';
import { createSDK } from '@/utils/api/EventurasApi';
import { getAccessToken } from '@/utils/getAccesstoken';

import EventProductsEditor from './EventProductsEditor';

type EventProductsPage = {
  params: Promise<{
    id: string;
  }>;
};

const EventProducts: React.FC<EventProductsPage> = async props => {
  const params = await props.params;
  const eventId = parseInt(params.id, 10);
  const t = await getTranslations();

  const eventuras = createSDK({ authHeader: await getAccessToken() });

  const eventInfo = await eventuras.events.getV3Events1({ id: eventId });
  const products = await eventuras.eventProducts.getV3EventsProducts({ eventId });

  return (
    <Wrapper fluid>
      <Section className="bg-white dark:bg-black py-10">
        <Container>
          <Heading as="h1" spacingClassName="pt-6 mb-3">
            {t('admin.products.labels.productsFor')} {eventInfo.title}
          </Heading>
        </Container>
      </Section>
      <Section className="py-10">
        <Container>
          <EventProductsEditor eventInfo={eventInfo} products={products} />
        </Container>
      </Section>
    </Wrapper>
  );
};

export default EventProducts;

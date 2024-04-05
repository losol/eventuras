import { Container, Heading, Section } from '@eventuras/ui';
import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import Wrapper from '@/components/eventuras/Wrapper';
import { createSDK } from '@/utils/api/EventurasApi';

import EventProductsEditor from './EventProductsEditor';

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
    <Wrapper fluid>
      <Section className="bg-white dark:bg-black py-10">
        <Container>
          <Heading as="h1" spacingClassName="pt-6 mb-3">
            {t('admin:products.labels.productsFor')} {eventInfo.title}
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

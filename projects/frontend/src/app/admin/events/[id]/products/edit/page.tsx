import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import { Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import { createSDK } from '@/utils/api/EventurasApi';

import EventProductsEditor from '../EventProductsEditor';

type EditEventinfoProps = {
  params: {
    id: string;
  };
};

const EditEventinfo: React.FC<EditEventinfoProps> = async ({ params }) => {
  const eventId = parseInt(params.id, 10);
  const { t } = createTranslation();

  const eventuras = createSDK({ authHeader: headers().get('Authorization') });

  const eventInfo = await eventuras.events.getV3Events1({ id: eventId });
  const products = await eventuras.eventProducts.getV3EventsProducts({ eventId });

  if (!eventInfo) {
    return <div>{t('common:errormessages.event-not-found')}</div>;
  }

  return (
    <Layout>
      <Heading as="h1" spacingClassName="pt-6 pb-3">
        {t('admin:products.labels.productsFor')}Products for {eventInfo.title}
      </Heading>
      <EventProductsEditor eventInfo={eventInfo} products={products} />
    </Layout>
  );
};

export default EditEventinfo;

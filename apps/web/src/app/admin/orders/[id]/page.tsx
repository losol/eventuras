import { Container, Heading, Section } from '@eventuras/ui';
import { Logger } from '@eventuras/utils';
import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';

import Order from '../Order';

type EventInfoProps = {
  params: {
    id: number;
  };
};
const OrderDetailPage: React.FC<EventInfoProps> = async ({ params }) => {
  const { t } = createTranslation();

  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: headers().get('Authorization'),
  });

  const order = await apiWrapper(() =>
    eventuras.orders.getV3Orders({
      id: params.id,
      includeRegistration: true,
      includeUser: true,
    })
  );

  if (!order.ok) {
    Logger.error(
      { namespace: 'EditEventinfo' },
      `Failed to fetch order id ${params.id}, error: ${order.error}`
    );
  }

  if (!order.ok) {
    return <div>{t('admin:orders.labels.notFound')}</div>;
  }

  return (
    <>
      <Section className="bg-white dark:bg-black   pb-8">
        <Container>
          <Heading as="h1">Order</Heading>
        </Container>
      </Section>
      <Section className="py-12">
        <Container>
          <Order order={order.value!} admin />
        </Container>
      </Section>
    </>
  );
};

export default OrderDetailPage;

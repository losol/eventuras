import { getTranslations } from 'next-intl/server';

import { getV3OrdersById } from '@eventuras/event-sdk';
import { Logger } from '@eventuras/logger';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import Order from '../Order';

type EventInfoProps = {
  params: Promise<{
    id: number;
  }>;
};
const OrderDetailPage: React.FC<EventInfoProps> = async props => {
  const params = await props.params;
  const t = await getTranslations();
  const response = await getV3OrdersById({
    path: { id: params.id },
    query: {
      IncludeRegistration: true,
      IncludeUser: true,
    },
  });
  if (!response.data) {
    Logger.error(
      { namespace: 'EditEventinfo' },
      `Failed to fetch order id ${params.id}, error: ${response.error}`
    );
  }
  if (!response.data) {
    return <div>{t('admin.orders.labels.notFound')}</div>;
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
          <Order order={response.data} admin />
        </Container>
      </Section>
    </>
  );
};
export default OrderDetailPage;

import { useTranslations } from 'next-intl';

import { formatDateSpan } from '@eventuras/core/datetime';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Definition, DescriptionList, Item, Term } from '@eventuras/ratio-ui/core/DescriptionList';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Table } from '@eventuras/ratio-ui/core/Table';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import { OrderDto } from '@/lib/eventuras-sdk';

import { OrderActionsMenu } from './OrderActionsMenu';
type OrderProps = {
  order: OrderDto;
  admin?: boolean;
};
const Order: React.FC<OrderProps> = ({ admin, order }) => {
  const t = useTranslations();
  const statusDescriptions = {
    Draft: t('common.order.status.labels.draft'),
    Verified: t('common.order.status.labels.verified'),
    Invoiced: t('common.order.status.labels.invoiced'),
    Cancelled: t('common.order.status.labels.cancelled'),
    Refunded: t('common.order.status.labels.refunded'),
  };
  return (
    <Card>
      <DescriptionList>
        <Item>
          <Term>{t('common.order.labels.id')}</Term>
          <Definition>{order.orderId}</Definition>
        </Item>
        <Item>
          <Term>{t('common.order.labels.status')}</Term>
          <Definition>
            <Badge>
              {order.status
                ? statusDescriptions[order.status]
                : t('common.order.status.labels.unknown')}
            </Badge>
          </Definition>
        </Item>
        <Item>
          <Term>{t('common.order.labels.date')}</Term>
          <Definition>{formatDateSpan(order.time!)}</Definition>
        </Item>
      </DescriptionList>
      <div>
        <Heading as="h4">{t('common.order.labels.items')}</Heading>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeadCell>{t('common.order.labels.id')}</Table.HeadCell>
              <Table.HeadCell>{t('common.order.labels.product')}</Table.HeadCell>
              <Table.HeadCell>{t('common.order.labels.variant')}</Table.HeadCell>
              <Table.HeadCell>{t('common.order.labels.quantity')}</Table.HeadCell>
              <Table.HeadCell>{t('common.order.labels.price')}</Table.HeadCell>
              <Table.HeadCell>{t('common.order.labels.total')}</Table.HeadCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {order.items?.map(item => (
              <Table.Row key={item.orderLineId}>
                <Table.Cell>{item.orderLineId}</Table.Cell>
                <Table.Cell>{item.product?.name}</Table.Cell>
                <Table.Cell>{item.productVariant?.name}</Table.Cell>
                <Table.Cell>{item.quantity}</Table.Cell>
                <Table.Cell>{item.product?.price}</Table.Cell>
                <Table.Cell>{(item.quantity ?? 0) * (item.product?.price ?? 0)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      {admin && (
        <Section className="mt-12">
          <OrderActionsMenu order={order} />
        </Section>
      )}
    </Card>
  );
};
export default Order;

import { useTranslations } from 'next-intl';

import { formatDateSpan } from '@eventuras/core/datetime';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Definition, DescriptionList, Item, Term } from '@eventuras/ratio-ui/core/DescriptionList';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import { OrderDto, OrderStatus } from "@/lib/eventuras-sdk";

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
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th>{t('common.order.labels.id')}</th>
              <th>{t('common.order.labels.product')}</th>
              <th>{t('common.order.labels.variant')}</th>
              <th>{t('common.order.labels.quantity')}</th>
              <th>{t('common.order.labels.price')}</th>
              <th>{t('common.order.labels.total')}</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, index) => (
              <tr key={index}>
                <td>{item.orderLineId}</td>
                <td>{item.product?.name}</td>
                <td>{item.productVariant?.name}</td>
                <td>{item.quantity}</td>
                <td>{item.product?.price}</td>
                <td>{(item.quantity ?? 0) * (item.product?.price ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

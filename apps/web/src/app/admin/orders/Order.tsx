import { OrderDto } from '@eventuras/sdk';
import Badge from '@eventuras/ui/Badge';
import Card from '@eventuras/ui/Card';
import { Definition, DescriptionList, Item, Term } from '@eventuras/ui/DescriptionList';
import Heading from '@eventuras/ui/Heading';
import createTranslation from 'next-translate/createTranslation';

import { formatDateSpan } from '@/utils/formatDate';

type OrderProps = {
  order: OrderDto;
};

const Order: React.FC<OrderProps> = ({ order }) => {
  const { t } = createTranslation();

  const statusDescriptions = {
    Draft: t('common:order.status.labels.draft'),
    Verified: t('common:order.status.labels.verified'),
    Invoiced: t('common:order.status.labels.invoiced'),
    Cancelled: t('common:order.status.labels.cancelled'),
    Refunded: t('common:order.status.labels.refunded'),
  };

  return (
    <Card>
      <DescriptionList>
        <Item>
          <Term>{t('common:order.labels.id')}</Term>
          <Definition>{order.orderId}</Definition>
        </Item>
        <Item>
          <Term>{t('common:order.labels.status')}</Term>
          <Definition>
            <Badge>
              {order.status
                ? statusDescriptions[order.status]
                : t('common:order.status.labels.unknown')}
            </Badge>
          </Definition>
        </Item>
        <Item>
          <Term>{t('common:order.labels.date')}</Term>
          <Definition>{formatDateSpan(order.time!)}</Definition>
        </Item>
      </DescriptionList>
      <div>
        <Heading as="h4">{t('common:order.labels.items')}</Heading>
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th>{t('common:order.labels.id')}</th>
              <th>{t('common:order.labels.product')}</th>
              <th>{t('common:order.labels.variant')}</th>
              <th>{t('common:order.labels.quantity')}</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, index) => (
              <tr key={index}>
                <td>{item.orderLineId}</td>
                <td>{item.product?.name}</td>
                <td>{item.productVariant?.name}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default Order;

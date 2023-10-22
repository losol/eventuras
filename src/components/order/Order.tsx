import { OrderDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';

type OrderProps = {
  order: OrderDto;
};

const Order: React.FC<OrderProps> = ({ order }) => {
  const { t } = createTranslation('orders');

  return (
    <div className="border p-4 mb-4">
      <h3 className="text-lg font-bold">
        {t('Order Id')}: {order.orderId}
      </h3>
      <p>
        {t('Status')}: {order.status}
      </p>
      <p>
        {t('Time')}: {order.time}
      </p>
      <div>
        <h4 className="text-md font-bold">{t('items')}</h4>
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th>{t('Id')}</th>
              <th>{t('Product')}</th>
              <th>{t('Variant')}</th>
              <th>{t('Quantity')}</th>
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
    </div>
  );
};

export default Order;

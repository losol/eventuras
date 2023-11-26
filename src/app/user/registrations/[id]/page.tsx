import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import Order from '@/components/order/Order';
import { Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import { createSDK } from '@/utils/api/EventurasApi';

type UserRegistrationPageProps = {
  params: {
    id: number;
  };
};

const UserRegistrationPage: React.FC<UserRegistrationPageProps> = async ({ params }) => {
  const eventuras = createSDK({ authHeader: headers().get('Authorization') });
  const { t } = createTranslation();

  const registration = await eventuras.registrations.getV3Registrations1({
    id: params.id,
    includeEventInfo: true,
    includeUserInfo: true,
    includeProducts: true,
    includeOrders: true,
  });

  if (registration === null) return <p>{t('user:registration.not-found')}</p>;

  if (registration)
    return (
      <Layout>
        <Heading>{t('user:registration.title')}</Heading>
        <p data-test-id="registration-id-container">{`${t('user:registration.id')}: ${
          registration.registrationId
        }`}</p>
        <p>{`${t('user:registration.event-title')}: ${registration.event?.title}`}</p>
        <p>{`${t('common:user.name')}: ${registration.user?.name}`}</p>
        <p>{`${t('user:registration.status')}: ${registration.status}`}</p>
        <p>{`${t('user:registration.type')}: ${registration.type}`}</p>
        {registration?.products && registration?.products?.length > 0 && (
          <section id="products">
            <Heading as="h2">{t('user:registration.products')}</Heading>
            <ul>
              {registration.products.map((product, index) => (
                <li key={index} data-test-id={`product-container`}>
                  <p>{`${t('user:registration.product-name')}: ${product.product?.name}`}</p>
                  <p>{`${t('user:registration.product-description')}: ${product.product
                    ?.description}`}</p>
                  <p>
                    <span>{t('user:registration.quantity')}:</span>
                    {product.quantity}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
        {registration?.orders && registration?.orders?.length > 0 && (
          <section id="orders" className="py-8">
            <Heading as="h2">{t('user:registration.orders')}</Heading>
            {registration.orders.map((order, index) => (
              <Order key={index} order={order} />
            ))}
          </section>
        )}
      </Layout>
    );
};

export default UserRegistrationPage;

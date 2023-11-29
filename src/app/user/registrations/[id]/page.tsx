import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import Order from '@/components/order/Order';
import { Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';

type UserRegistrationPageProps = {
  params: {
    id: number;
  };
};

const UserRegistrationPage: React.FC<UserRegistrationPageProps> = async ({ params }) => {
  const eventuras = createSDK({ authHeader: headers().get('Authorization') });
  const { t } = createTranslation();

  const user = await apiWrapper(() => eventuras.users.getV3UsersMe({}));
  if (!user) return <Layout>{t('user:page.errors.profileNotFound')}</Layout>;

  const registration = await apiWrapper(() =>
    eventuras.registrations.getV3Registrations1({
      id: params.id,
      includeEventInfo: true,
      includeUserInfo: true,
      includeProducts: true,
      includeOrders: true,
    })
  );

  if (registration === null || !registration.value)
    return <p>{t('user:registration.not-found')}</p>;
  if (user.value?.id !== registration.value!.userId)
    return <Layout>{t('user:page.unauthorized')}</Layout>;

  if (registration)
    return (
      <Layout>
        <Heading>{t('user:registration.title')}</Heading>
        <p data-test-id="registration-id-container">{`${t('user:registration.id')}: ${
          registration.value!.registrationId
        }`}</p>
        <p>{`${t('user:registration.event-title')}: ${registration.value.event?.title}`}</p>
        <p>{`${t('common:user.name')}: ${registration.value.user?.name}`}</p>
        <p>{`${t('user:registration.status')}: ${registration.value.status}`}</p>
        <p>{`${t('user:registration.type')}: ${registration.value.type}`}</p>
        {registration?.value!.products && registration?.value.products?.length > 0 && (
          <section id="products" data-test-id="product-container">
            <Heading as="h2">{t('user:registration.products')}</Heading>
            <ul>
              {registration.value.products.map((product, index) => (
                <li key={index}>
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
        {registration?.value.orders && registration?.value.orders?.length > 0 && (
          <section id="orders" className="py-8">
            <Heading as="h2">{t('user:registration.orders')}</Heading>
            {registration.value.orders.map((order, index) => (
              <Order key={index} order={order} />
            ))}
          </section>
        )}
      </Layout>
    );
};

export default UserRegistrationPage;

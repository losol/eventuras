import { ProductDto } from '@losol/eventuras';
import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import EditEventRegistrationsDialog from '@/components/eventuras/EditEventRegistrationDialog';
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

  const getRegistrationResult = await apiWrapper(() =>
    eventuras.registrations.getV3Registrations1({
      id: params.id,
      includeEventInfo: true,
      includeUserInfo: true,
      includeProducts: true,
      includeOrders: true,
    })
  );

  if (!getRegistrationResult.value) return <p>{t('user:registration.not-found')}</p>;
  if (user.value?.id !== getRegistrationResult.value!.userId)
    return <Layout>{t('user:page.unauthorized')}</Layout>;

  const registration = getRegistrationResult.value;
  let availableProducts: ProductDto[] = [];
  const getEventProductsResult = await apiWrapper(() =>
    eventuras.eventProducts.getV3EventsProducts({ eventId: registration.event!.id! })
  );
  if (getEventProductsResult.ok && getEventProductsResult.value) {
    availableProducts = getEventProductsResult.value;
  }
  return (
    <Layout>
      <Heading>{t('user:registration.title')}</Heading>
      <p data-test-id="registration-id-container">{`${t('user:registration.id')}:
        ${registration.registrationId}`}</p>
      <p>{`${t('user:registration.event-title')}: ${registration.event?.title}`}</p>
      <p>{`${t('common:user.name')}: ${registration.user?.name}`}</p>
      <p>{`${t('user:registration.status')}: ${registration.status}`}</p>
      <p>{`${t('user:registration.type')}: ${registration.type}`}</p>
      {registration.products && registration.products?.length > 0 && (
        <section id="products" data-test-id="product-container">
          <Heading as="h2">{t('user:registration.products')}</Heading>
          <ul>
            {registration.products.map((product, index) => (
              <li key={index}>
                <p>{`${t('user:registration.product-name')}: ${product.product?.name}`}</p>
                <p>{`${t('common:labels.description')}: ${product.product?.description}`}</p>
                <p>
                  <span>{t('user:registration.quantity')}:</span>
                  {product.quantity}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {registration.orders && registration.orders?.length > 0 && (
        <section id="orders" className="py-8">
          <Heading as="h2">{t('user:registration.orders')}</Heading>
          {registration.orders.map((order, index) => (
            <Order key={index} order={order} />
          ))}
        </section>
      )}
      {availableProducts && availableProducts.length > 0 && (
        <EditEventRegistrationsDialog
          eventProducts={availableProducts}
          currentRegistration={registration}
        />
      )}
    </Layout>
  );
};

export default UserRegistrationPage;

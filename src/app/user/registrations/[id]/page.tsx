import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import Order from '@/components/order/Order';
import { Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import createSDK from '@/utils/createSDK';
import { setupOpenAPI } from '@/utils/setupOpenApi';

type UserRegistrationPageProps = {
  params: {
    id: number;
  };
};

const UserProfilePage: React.FC<UserRegistrationPageProps> = async ({ params }) => {
  const eventuras = createSDK();
  const { t } = createTranslation('common');

  setupOpenAPI(headers().get('Authorization'));

  const registration = await eventuras.registrations.getV3Registrations1({
    id: params.id,
    includeEventInfo: true,
    includeUserInfo: true,
    includeProducts: true,
    includeOrders: true,
  });

  if (registration === null) return <p>Registration not found</p>;

  if (registration)
    return (
      <Layout>
        <Heading>{t('Registration')}</Heading>
        <p>Registration id: {registration.registrationId}</p>
        <p>Event title: {registration.event?.title}</p>
        <p>User: {registration.user?.name}</p>
        <p>Status: {registration.status}</p>
        <p>Type: {registration.type}</p>

        {registration?.products && registration?.products?.length > 0 && (
          <section id="products">
            <Heading as="h2">Products</Heading>
            <ul>
              {registration!.products?.map((product, index) => (
                <li key={index}>
                  <p>{product.product?.name}</p>
                  <p>{product.product?.description}</p>
                  <p>
                    <span>Quantity:</span>
                    {product.quantity}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
        {registration?.orders && registration?.orders?.length > 0 && (
          <section id="orders" className="py-8">
            <Heading as="h2">Orders:</Heading>
            {registration!.orders?.map((order, index) => <Order key={index} order={order} />)}
          </section>
        )}
      </Layout>
    );
};

export default UserProfilePage;

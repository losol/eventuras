import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';
import React from 'react';

import { Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import MarkdownContent from '@/components/ui/MarkdownContent';
import { createSDK } from '@/utils/api/EventurasApi';

type UserEventPageProps = {
  params: {
    id: number;
  };
};

const UserEventPage: React.FC<UserEventPageProps> = async ({ params }) => {
  const eventuras = createSDK({ authHeader: headers().get('Authorization') });
  const { t } = createTranslation();

  const user = await eventuras.users.getV3UsersMe({});
  if (!user) {
    return <div>{t('user:loginRequired')}</div>;
  }

  const eventInfo = await eventuras.events.getV3Events1({
    id: params.id,
  });
  if (!eventInfo) {
    return <div>{t('user:events.eventNotFound')}</div>;
  }

  const userEventRegistrations = await eventuras.registrations.getV3Registrations({
    userId: user.id!,
    eventId: params.id,
    includeProducts: true,
  });
  if (!userEventRegistrations?.data || userEventRegistrations.total! === 0) {
    return <div>{t('user:events.notRegistered')}</div>;
  }

  return (
    <Layout>
      {eventInfo.title && (
        <>
          <p className="pt-16">{t('user:events.registration.titleLabel')}</p>
          <Heading as="h1" spacingClassName="pt-0 my-5">
            {eventInfo.title}
          </Heading>
        </>
      )}
      {userEventRegistrations.data.map(registration => (
        <>
          {registration.products?.map(product => (
            <div key={product.productId}>{product.product?.name}</div>
          ))}
          <Link
            href={`/user/registrations/${registration.registrationId}`}
            variant="button-primary"
            data-test-id="registration-page-link"
          >
            {t('user:events.buttons.viewRegistration')}
          </Link>
        </>
      ))}

      {eventInfo?.welcomeLetter && (
        <div className="welcome-letter dark:bg-gray-700 bg-white my-10 p-3">
          <Heading as="h2" spacingClassName="mb-5 mt-0 pt-0">
            {t('user:events.welcomeLetter')}
          </Heading>
          <MarkdownContent markdown={eventInfo?.welcomeLetter} />
        </div>
      )}
    </Layout>
  );
};

export default UserEventPage;

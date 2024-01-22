import { ProductDto } from '@losol/eventuras/dist/models/ProductDto';
import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';
import React from 'react';

import { Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import { createSDK } from '@/utils/api/EventurasApi';
import getSiteSettings from '@/utils/site/getSiteSettings';

import EventFlow from './EventFlow';

type UserEventPageProps = {
  params: {
    id: number;
  };
};

const UserEventPage: React.FC<UserEventPageProps> = async ({ params }) => {
  const eventuras = createSDK({ authHeader: headers().get('Authorization') });
  const { t } = createTranslation();
  const siteInfo = await getSiteSettings();

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
  const availableProducts: ProductDto[] = await eventuras.eventProducts.getV3EventsProducts({
    eventId: params.id,
  });

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
      <EventFlow
        user={user}
        eventInfo={eventInfo}
        availableProducts={availableProducts}
        siteInfo={siteInfo!}
      />
    </Layout>
  );
};

export default UserEventPage;

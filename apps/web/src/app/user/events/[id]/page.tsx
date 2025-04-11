import { Heading } from '@eventuras/ui';
import createTranslation from 'next-translate/createTranslation';
import React from 'react';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { getAccessToken } from '@/utils/getAccesstoken';
import { oauthConfig } from '@/utils/oauthConfig';
import getSiteSettings from '@/utils/site/getSiteSettings';

import EventFlow from './EventFlow';

type UserEventPageProps = {
  params: {
    id: number;
  };
};

const UserEventPage: React.FC<UserEventPageProps> = async ({ params }) => {
  const eventuras = createSDK({ authHeader: await getAccessToken() });
  const { t } = createTranslation();
  const siteInfo = await getSiteSettings();

  const user = await apiWrapper(() => eventuras.userProfile.getV3Userprofile({}));
  if (!user.value) {
    return <div>{t('user:loginRequired')}</div>;
  }

  const eventInfo = await apiWrapper(() =>
    eventuras.events.getV3Events1({
      id: params.id,
    })
  );
  if (!eventInfo.value) {
    return <div>{t('user:events.eventNotFound')}</div>;
  }

  const availableProducts = await apiWrapper(() =>
    eventuras.eventProducts.getV3EventsProducts({
      eventId: params.id,
    })
  );

  return (
    <Wrapper>
      {eventInfo.value.title && (
        <>
          <p className="pt-16">{t('user:events.registration.titleLabel')}</p>
          <Heading as="h1" spacingClassName="pt-0 my-5">
            {eventInfo.value.title}
          </Heading>
        </>
      )}
      <EventFlow
        user={user.value}
        eventInfo={eventInfo.value}
        availableProducts={availableProducts.value ?? []}
        siteInfo={siteInfo!}
      />
    </Wrapper>
  );
};

export default UserEventPage;

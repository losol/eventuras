import { Heading } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';
import React from 'react';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { getAccessToken } from '@/utils/getAccesstoken';
import getSiteSettings from '@/utils/site/getSiteSettings';

import EventFlow from './EventFlow';

type UserEventPageProps = {
  params: Promise<{
    id: number;
  }>;
};

export default async function UserEventPage({ params }: Readonly<UserEventPageProps>) {
  const { id } = await params;

  if (isNaN(id)) {
    return (
      <Wrapper>
        <Heading>Invalid event ID</Heading>
      </Wrapper>
    );
  }

  const t = await getTranslations();
  const accessToken = await getAccessToken();
  const eventuras = createSDK({ authHeader: accessToken });
  const siteInfo = await getSiteSettings();

  const [userResult, eventInfoResult, availableProductsResult] = await Promise.all([
    apiWrapper(() => eventuras.userProfile.getV3Userprofile({})),
    apiWrapper(() => eventuras.events.getV3Events1({ id })),
    apiWrapper(() => eventuras.eventProducts.getV3EventsProducts({ eventId: id })),
  ]);

  // Handle user not logged in
  if (!userResult.value) {
    return (
      <Wrapper>
        <Heading>{t('user.loginRequired')}</Heading>
      </Wrapper>
    );
  }

  // Handle event not found
  if (!eventInfoResult.value) {
    return (
      <Wrapper>
        <Heading>{t('user.events.eventNotFound')}</Heading>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <section className="mt-16">
        {eventInfoResult.value.title && (
          <>
            <p className="text-sm text-gray-600">{t('user.events.registration.titleLabel')}</p>
            <Heading as="h1" spacingClassName="pt-0 my-5">
              {eventInfoResult.value.title}
            </Heading>
          </>
        )}

        <EventFlow
          user={userResult.value}
          eventInfo={eventInfoResult.value}
          availableProducts={availableProductsResult.value ?? []}
          siteInfo={siteInfo!}
        />
      </section>
    </Wrapper>
  );
}

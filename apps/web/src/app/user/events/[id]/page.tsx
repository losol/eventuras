import { Heading } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';
import React from 'react';

import Wrapper from '@/components/eventuras/Wrapper';
import { getV3Userprofile, getV3EventsById, getV3EventsByEventIdProducts } from '@eventuras/event-sdk';
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

  const t = await getTranslations();  const siteInfo = await getSiteSettings();

  const [userResponse, eventInfoResponse, availableProductsResponse] = await Promise.all([
    getV3Userprofile(),
    getV3EventsById({ path: { id } }),
    getV3EventsByEventIdProducts({ path: { eventId: id } }),
  ]);

  // Handle user not logged in
  if (!userResponse.data) {
    return (
      <Wrapper>
        <Heading>{t('user.loginRequired')}</Heading>
      </Wrapper>
    );
  }

  // Handle event not found
  if (!eventInfoResponse.data) {
    return (
      <Wrapper>
        <Heading>{t('user.events.eventNotFound')}</Heading>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <section className="mt-16">
        {eventInfoResponse.data.title && (
          <>
            <p className="text-sm text-gray-600">{t('user.events.registration.titleLabel')}</p>
            <Heading as="h1" padding="pt-0 my-5">
              {eventInfoResponse.data.title}
            </Heading>
          </>
        )}

        <EventFlow
          user={userResponse.data}
          eventInfo={eventInfoResponse.data}
          availableProducts={availableProductsResponse.data ?? []}
          siteInfo={siteInfo!}
        />
      </section>
    </Wrapper>
  );
}

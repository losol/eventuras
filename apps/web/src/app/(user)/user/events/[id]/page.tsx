import React from 'react';
import { getTranslations } from 'next-intl/server';

import {
  getV3EventsByEventIdProducts,
  getV3EventsById,
  getV3Userprofile,
} from '@eventuras/event-sdk';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

import getSiteSettings from '@/utils/site/getSiteSettings';

import EventFlowContainer from './components/EventFlowContainer';

type UserEventPageProps = {
  params: Promise<{
    id: number;
  }>;
};
export default async function UserEventPage({ params }: Readonly<UserEventPageProps>) {
  const { id } = await params;
  if (isNaN(id)) {
    return <Heading>Invalid event ID</Heading>;
  }
  const t = await getTranslations();
  const siteInfo = await getSiteSettings();
  const [userResponse, eventInfoResponse, availableProductsResponse] = await Promise.all([
    getV3Userprofile(),
    getV3EventsById({ path: { id } }),
    getV3EventsByEventIdProducts({ path: { eventId: id } }),
  ]);
  // Handle user not logged in
  if (!userResponse.data) {
    return <Heading>{t('user.loginRequired')}</Heading>;
  }
  // Handle event not found
  if (!eventInfoResponse.data) {
    return <Heading>{t('user.events.eventNotFound')}</Heading>;
  }
  return (
    <section className="mt-16">
      {eventInfoResponse.data.title && (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('user.events.registration.titleLabel')}
          </p>
          <Heading as="h1" padding="pt-0 my-5">
            {eventInfoResponse.data.title}
          </Heading>
        </>
      )}
      <EventFlowContainer
        user={userResponse.data}
        eventInfo={eventInfoResponse.data}
        availableProducts={availableProductsResponse.data ?? []}
        siteInfo={siteInfo!}
      />
    </section>
  );
}

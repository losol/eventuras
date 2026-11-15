import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Logger } from '@eventuras/logger';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';

import {
  getV3EventsByEventIdProducts,
  getV3EventsById,
  getV3Userprofile,
} from '@/lib/eventuras-sdk';
import getSiteSettings from '@/utils/site/getSiteSettings';

import EventFlowContainer from './components/EventFlowContainer';

const logger = Logger.create({
  namespace: 'web:user:events',
  context: { page: 'UserEventPage' },
});

function getResponseStatus(error: unknown) {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as { status?: number }).status;
  }

  return undefined;
}

type UserEventPageProps = {
  params: Promise<{
    id: number;
  }>;
};
export default async function UserEventPage({ params }: Readonly<UserEventPageProps>) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (Number.isNaN(id)) {
    return <Heading>Invalid event ID</Heading>;
  }
  const t = await getTranslations();
  const siteInfo = await getSiteSettings();
  const [userResponse, eventInfoResponse, availableProductsResponse] = await Promise.all([
    getV3Userprofile(),
    getV3EventsById({ path: { id } }),
    getV3EventsByEventIdProducts({ path: { eventId: id } }),
  ]);

  // The proxy refreshed the session before this render, so a failure here needs a new login.
  if (!userResponse.data) {
    logger.error(
      { error: userResponse.error, eventId: id },
      'Failed to fetch user profile, redirecting to login'
    );
    const returnUrl = `/user/events/${id}`;
    redirect(`/api/auth/login?returnTo=${encodeURIComponent(returnUrl)}`);
  }

  // Handle event not found or fetch error
  if (!eventInfoResponse.data) {
    logger.error(
      {
        eventId: id,
        error: eventInfoResponse.error,
        statusCode: getResponseStatus(eventInfoResponse.error),
      },
      'Event fetch failed - data is null'
    );

    // If it's a 500 error, the event might exist but have invalid data
    // If it's a 404, the event doesn't exist
    // Either way, we can't proceed with registration
    notFound();
  }

  if (!availableProductsResponse.data && availableProductsResponse.error) {
    logger.error(
      {
        eventId: id,
        error: availableProductsResponse.error,
        statusCode: getResponseStatus(availableProductsResponse.error),
      },
      'Failed to load registration products for event page'
    );
  }

  logger.debug(
    {
      eventId: id,
      hasTitle: !!eventInfoResponse.data.title,
      status: eventInfoResponse.data.status,
      hasDescription: !!eventInfoResponse.data.description,
      availableProductCount: availableProductsResponse.data?.length ?? 0,
    },
    'Event data loaded for registration'
  );

  return (
    <Container marginY="xl">
      {eventInfoResponse.data.title && <Heading as="h1">{eventInfoResponse.data.title}</Heading>}

      <EventFlowContainer
        user={userResponse.data}
        eventInfo={eventInfoResponse.data}
        availableProducts={availableProductsResponse.data ?? []}
        siteInfo={siteInfo!}
      />
    </Container>
  );
}

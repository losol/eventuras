import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getCurrentSession, refreshCurrentSession } from '@eventuras/fides-auth-next';
import { Logger } from '@eventuras/logger';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';

import {
  getV3EventsByEventIdProducts,
  getV3EventsById,
  getV3Userprofile,
} from '@/lib/eventuras-sdk';
import { oauthConfig } from '@/utils/oauthConfig';
import getSiteSettings from '@/utils/site/getSiteSettings';

import EventFlowContainer from './components/EventFlowContainer';

const logger = Logger.create({
  namespace: 'web:user:events',
  context: { page: 'UserEventPage' },
});

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

  // Handle user profile fetch error
  // This is a critical flow - try everything possible to help the user register
  if (!userResponse.data) {
    logger.warn(
      { error: userResponse.error, eventId: id },
      'Failed to fetch user profile - attempting session refresh'
    );

    // Try to refresh the session in case the token expired
    const currentSession = await getCurrentSession();
    if (currentSession?.tokens?.refreshToken) {
      logger.info('Attempting to refresh session for event registration');
      const refreshedSession = await refreshCurrentSession(oauthConfig);

      if (refreshedSession) {
        logger.info('Session refreshed successfully - retrying user profile fetch');

        // Retry the user profile fetch with refreshed token
        const retryUserResponse = await getV3Userprofile();

        if (retryUserResponse.data) {
          logger.info('User profile fetch successful after session refresh');
          // Continue with the rest of the page using retryUserResponse
          return (
            <section className="mt-16">
              {eventInfoResponse.data?.title && (
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
                user={retryUserResponse.data}
                eventInfo={eventInfoResponse.data!}
                availableProducts={availableProductsResponse.data ?? []}
                siteInfo={siteInfo!}
              />
            </section>
          );
        }
      }
    }

    // Session refresh failed or didn't help - redirect to login
    logger.error(
      { error: userResponse.error, eventId: id },
      'Failed to fetch user profile even after session refresh - redirecting to login'
    );

    // Redirect to login with return URL to come back to this event
    const returnUrl = `/user/events/${id}`;
    redirect(`/api/login/auth0?returnTo=${encodeURIComponent(returnUrl)}`);
  }

  // Handle event not found or fetch error
  if (!eventInfoResponse.data) {
    logger.error(
      {
        eventId: id,
        error: eventInfoResponse.error,
        statusCode:
          eventInfoResponse.error &&
          typeof eventInfoResponse.error === 'object' &&
          'status' in eventInfoResponse.error
            ? (eventInfoResponse.error as { status?: number }).status
            : undefined,
      },
      'Event fetch failed - data is null'
    );

    // If it's a 500 error, the event might exist but have invalid data
    // If it's a 404, the event doesn't exist
    // Either way, we can't proceed with registration
    notFound();
  }

  logger.info(
    {
      eventId: id,
      hasTitle: !!eventInfoResponse.data.title,
      status: eventInfoResponse.data.status,
      hasDescription: !!eventInfoResponse.data.description,
    },
    'Event data loaded for registration'
  );

  return (
    <Container>
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

import { Heading, Section, Text } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/logger';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import EventEditor from '@/app/admin/events/EventEditor';
import Wrapper from '@/components/eventuras/Wrapper';
import { getV3EventsById } from '@eventuras/event-sdk';

type EditEventinfoProps = {
  params: Promise<{
    id: number;
  }>;
};

const logger = Logger.create({
  namespace: 'web:admin',
  context: { module: 'page:editEvent' }
});

type PageState =
  | { type: 'success'; data: Awaited<ReturnType<typeof getV3EventsById>>['data'] }
  | { type: 'http-error'; status?: number; message?: string }
  | { type: 'network-error'; code?: string; message?: string };

export default async function EditEventinfo({ params }: Readonly<EditEventinfoProps>) {
  const { id } = await params;
  const t = await getTranslations();

  // Fetch data and determine page state (no JSX in try/catch)
  let pageState: PageState;

  try {
    const response = await getV3EventsById({
      path: { id }
    });

    if (response.data) {
      logger.info({ eventId: id }, 'Successfully fetched event for editing');
      pageState = { type: 'success', data: response.data };
    } else if (response.error) {
      const error = response.error as { status?: number; message?: string };

      // 404 - Event not found
      if (error.status === 404) {
        logger.warn({ eventId: id }, 'Event not found');
        notFound();
      }

      // Other HTTP errors
      logger.error({
        eventId: id,
        error: response.error,
        status: error.status
      }, 'Failed to fetch event for editing');

      pageState = {
        type: 'http-error',
        status: error.status,
        message: error.message
      };
    } else {
      // Unexpected - no data and no error
      logger.error({ eventId: id }, 'Unexpected response: no data and no error');
      notFound();
    }
  } catch (err) {
    // Network errors, connection refused, etc.
    const error = err as { cause?: { code?: string }; code?: string; message?: string };

    logger.error({
      eventId: id,
      error: err,
      code: error?.cause?.code || error?.code
    }, 'Exception while fetching event for editing');

    pageState = {
      type: 'network-error',
      code: error?.cause?.code || error?.code,
      message: error?.message
    };
  }

  // Render based on page state
  if (pageState.type === 'success') {
    return (
      <Wrapper>
        <Heading>{t(`admin.editEvent.content.title`)}</Heading>
        <EventEditor eventinfo={pageState.data!} />
      </Wrapper>
    );
  }

  if (pageState.type === 'http-error') {
    const errorMessage = pageState.status === 403
      ? t('common.access-denied')
      : pageState.status && pageState.status >= 500
      ? t('common.server-error')
      : t('common.error-loading-event');

    return (
      <Wrapper>
        <Section className="py-12">
          <Heading as="h1" className="text-red-600 dark:text-red-400">
            {t('common.error')}
          </Heading>
          <Text className="mt-4">{errorMessage}</Text>
          {pageState.message && (
            <Text className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {pageState.message}
            </Text>
          )}
          <div className="mt-6 flex gap-4">
            <Link
              href={`/admin/events/${id}`}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              {t('common.back-to-event')}
            </Link>
            <Link
              href="/admin/events"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t('common.back-to-events')}
            </Link>
          </div>
        </Section>
      </Wrapper>
    );
  }

  // network-error
  const errorMessage = pageState.code === 'ECONNREFUSED'
    ? t('common.backend-unavailable')
    : t('common.network-error');

  return (
    <Wrapper>
      <Section className="py-12">
        <Heading as="h1" className="text-red-600 dark:text-red-400">
          {t('common.connection-error')}
        </Heading>
        <Text className="mt-4">{errorMessage}</Text>
        <Text className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('common.try-again-later')}
        </Text>
        <div className="mt-6">
          <Link
            href="/admin/events"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors inline-block"
          >
            {t('common.back-to-events')}
          </Link>
        </div>
      </Section>
    </Wrapper>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Logger } from '@eventuras/logger';
import { Error } from '@eventuras/ratio-ui/blocks/Error';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

import EventEditor from '@/app/(admin)/admin/events/EventEditor';
import { getV3EventsById } from '@/lib/eventuras-sdk';

type EditEventinfoProps = {
  params: Promise<{
    id: number;
  }>;
};
const logger = Logger.create({
  namespace: 'web:admin',
  context: { module: 'page:editEvent' },
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
      path: { id },
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
      logger.error(
        {
          eventId: id,
          error: response.error,
          status: error.status,
        },
        'Failed to fetch event for editing'
      );
      pageState = {
        type: 'http-error',
        status: error.status,
        message: error.message,
      };
    } else {
      // Unexpected - no data and no error
      logger.error({ eventId: id }, 'Unexpected response: no data and no error');
      notFound();
    }
  } catch (err) {
    // Network errors, connection refused, etc.
    const error = err as { cause?: { code?: string }; code?: string; message?: string };
    logger.error(
      {
        eventId: id,
        error: err,
        code: error?.cause?.code || error?.code,
      },
      'Exception while fetching event for editing'
    );
    pageState = {
      type: 'network-error',
      code: error?.cause?.code || error?.code,
      message: error?.message,
    };
  }
  // Render based on page state
  if (pageState.type === 'success') {
    return (
      <>
        <Heading>{t(`admin.editEvent.content.title`)}</Heading>
        <EventEditor eventinfo={pageState.data!} />
      </>
    );
  }
  if (pageState.type === 'http-error') {
    const errorType =
      pageState.status === 403
        ? 'forbidden'
        : pageState.status && pageState.status >= 500
          ? 'server-error'
          : 'generic';
    const errorTitle =
      pageState.status === 403
        ? t('common.access-denied')
        : pageState.status && pageState.status >= 500
          ? t('common.server-error')
          : t('common.error');
    const errorMessage =
      pageState.status === 403
        ? t('common.access-denied')
        : pageState.status && pageState.status >= 500
          ? t('common.server-error')
          : t('common.error-loading-event');
    return (
      <Error type={errorType} tone="error">
        <Error.Title>{errorTitle}</Error.Title>
        <Error.Description>{errorMessage}</Error.Description>
        {pageState.message && <Error.Details>{pageState.message}</Error.Details>}
        <Error.Actions>
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
        </Error.Actions>
      </Error>
    );
  }
  // network-error
  const errorMessage =
    pageState.code === 'ECONNREFUSED' ? t('common.backend-unavailable') : t('common.network-error');
  return (
    <Error type="network-error" tone="error">
      <Error.Title>{t('common.connection-error')}</Error.Title>
      <Error.Description>{errorMessage}</Error.Description>
      <Error.Details>{t('common.try-again-later')}</Error.Details>
      <Error.Actions>
        <Link
          href="/admin/events"
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {t('common.back-to-events')}
        </Link>
      </Error.Actions>
    </Error>
  );
}

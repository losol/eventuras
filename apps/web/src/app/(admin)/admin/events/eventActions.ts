'use server';

import { EventDto, getV3Events } from '@eventuras/event-sdk';
import { Logger } from '@eventuras/logger';

import { client, configureEventurasClient } from '@/lib/eventuras-client';

const logger = Logger.create({ namespace: 'web:admin', context: { module: 'eventActions' } });

export interface FetchEventsParams {
  organizationId: number;
  includePastEvents?: boolean;
  page?: number;
  pageSize?: number;
  startDate?: string;
}

export interface FetchEventsResult {
  data: EventDto[];
  pages: number;
  count: number;
}

export async function fetchEvents({
  organizationId,
  includePastEvents = false,
  page = 1,
  pageSize = 25,
  startDate,
}: FetchEventsParams): Promise<FetchEventsResult> {
  // Ensure client is configured with auth and base URL
  await configureEventurasClient();

  logger.debug(
    {
      organizationId,
      includePastEvents,
      page,
      pageSize,
      startDate,
    },
    'Fetching events'
  );

  try {
    const response = await getV3Events({
      client,
      query: {
        OrganizationId: organizationId,
        IncludeDraftEvents: true,
        IncludePastEvents: includePastEvents,
        Start: startDate,
        Period: 'Contain',
        Page: page,
        Count: pageSize,
      },
    });

    if (!response.data) {
      logger.warn('No data in response from getV3Events');
      throw new Error('No data received from API');
    }

    const result = {
      data: response.data.data ?? [],
      pages: response.data.pages ?? 0,
      count: response.data.count ?? 0,
    };

    logger.debug(
      {
        count: result.data.length,
        pages: result.pages,
        totalCount: result.count,
      },
      'Events fetched successfully'
    );

    return result;
  } catch (error) {
    const errorWithCause = error as { cause?: { code?: string }; code?: string; message?: string };
    const errorCode = errorWithCause?.cause?.code || errorWithCause?.code;

    logger.error(
      {
        error: {
          message: errorWithCause?.message,
          code: errorCode,
          cause: errorWithCause?.cause,
        },
        request: {
          organizationId,
          page,
          pageSize,
          includePastEvents,
          startDate,
        },
      },
      `Failed to fetch events${errorCode ? ` (${errorCode})` : ''}`
    );
    throw error;
  }
}

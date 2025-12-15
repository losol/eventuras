'use server';

import { Logger } from '@eventuras/logger';

import { client } from '@/lib/eventuras-client';
import { EventDto, getV3Events } from '@/lib/eventuras-sdk';

const logger = Logger.create({ namespace: 'web:admin', context: { module: 'eventActions' } });

export interface FetchEventsParams {
  organizationId: number;
  includePastEvents?: boolean;
  page?: number;
  pageSize?: number;
  startDate?: string;
  ordering?: string[];
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
  ordering,
}: FetchEventsParams): Promise<FetchEventsResult> {
  logger.debug(
    {
      organizationId,
      includePastEvents,
      page,
      pageSize,
      startDate,
      ordering,
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
        Ordering: ordering,
      },
    });

    if (!response.data) {
      logger.error(
        {
          error: response.error,
          query: {
            organizationId,
            includePastEvents,
            page,
            pageSize,
            startDate,
            ordering,
          },
        },
        'No data in response from getV3Events'
      );
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

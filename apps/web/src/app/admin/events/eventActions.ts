'use server';

import { Logger } from '@eventuras/logger';
import { getV3Events, EventDto } from '@eventuras/event-sdk';

const logger = Logger.create({ namespace: 'web:admin:events:actions' });

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
  startDate
}: FetchEventsParams): Promise<FetchEventsResult> {
  logger.info(
    {
      organizationId,
      includePastEvents,
      page,
      pageSize,
      startDate
    },
    'Fetching events'
  );

  try {    const response = await getV3Events({
      query: {
        OrganizationId: organizationId,
        IncludeDraftEvents: true,
        IncludePastEvents: includePastEvents,
        Start: startDate,
        Period: 'Contain',
        Page: page,
        Count: pageSize
      }
    });

    if (!response.data) {
      logger.warn({ response }, 'No data in response');
      throw new Error('No data received from API');
    }

    const result = {
      data: response.data.data ?? [],
      pages: response.data.pages ?? 0,
      count: response.data.count ?? 0
    };

    logger.info(
      {
        count: result.data.length,
        pages: result.pages,
        totalCount: result.count
      },
      'Events fetched successfully'
    );

    return result;
  } catch (error) {
    logger.error(error, 'Failed to fetch events');
    throw error;
  }
}

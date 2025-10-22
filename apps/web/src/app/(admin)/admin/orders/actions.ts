'use server';

import { getV3Orders, OrderDto } from '@eventuras/event-sdk';

import { appConfig } from '@/config.server';
import { client, configureEventurasClient } from '@/lib/eventuras-client';

export interface GetOrdersResult {
  data: OrderDto[];
  pages: number;
  count: number;
}

export async function getOrders(page: number = 1, pageSize: number = 50) {
  await configureEventurasClient();

  try {
    const organizationId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;

    const { data, error } = await getV3Orders({
      client,
      headers: {
        'Eventuras-Org-Id':
          typeof organizationId === 'number'
            ? organizationId
            : parseInt(organizationId as string, 10),
      },
      query: {
        OrganizationId:
          typeof organizationId === 'number'
            ? organizationId
            : parseInt(organizationId as string, 10),
        IncludeUser: true,
        IncludeRegistration: true,
        Page: page,
        Count: pageSize,
        Ordering: ['time:desc'],
      },
    });

    if (error) {
      console.error('Failed to fetch orders:', error);
      return {
        ok: false as const,
        error: String(error),
        data: null,
      };
    }

    // Type assertion for the API response structure
    const responseData = data as unknown as GetOrdersResult;

    return {
      ok: true as const,
      data: responseData,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

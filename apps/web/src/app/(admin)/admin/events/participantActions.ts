'use server';

import { Logger } from '@eventuras/logger';

import { getV3Registrations, getV3RegistrationsById, RegistrationDto } from '@/lib/eventuras-sdk';

const logger = Logger.create({
  namespace: 'web:admin:events',
  context: { module: 'participantActions' },
});

export async function getRegistrationDetails(registrationId: number) {
  logger.info({ registrationId }, 'Loading registration details');

  try {
    const response = await getV3RegistrationsById({
      path: { id: registrationId },
      query: {
        IncludeProducts: true,
        IncludeOrders: true,
        IncludeUserInfo: true,
      },
    });

    if (!response.data) {
      logger.error({ registrationId }, 'Registration not found');
      return null;
    }

    logger.info({ registrationId }, 'Registration loaded successfully');
    return response.data;
  } catch (error) {
    logger.error({ error, registrationId }, 'Failed to load registration');
    return null;
  }
}

export async function getEventRegistrations(eventId: number) {
  logger.info({ eventId }, 'Loading event registrations');

  try {
    const response = await getV3Registrations({
      query: {
        EventId: eventId,
        IncludeUserInfo: true,
        IncludeProducts: true,
        IncludeOrders: true,
      },
    });

    if (!response.data?.data) {
      logger.error({ eventId }, 'Failed to load registrations');
      return [];
    }

    logger.info({ eventId, count: response.data.data.length }, 'Registrations loaded successfully');
    return response.data.data;
  } catch (error) {
    logger.error({ error, eventId }, 'Failed to load registrations');
    return [];
  }
}

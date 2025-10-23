'use server';

import { Logger } from '@eventuras/logger';

import { getV3RegistrationsById } from "@/lib/eventuras-sdk";

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

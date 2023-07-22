// import { EventType, UserType, UserEventRegistrationType } from 'types';
import { UserEventRegistrationType } from 'types';

import { fetcher } from './fetcher';

export const registerForEvent = async (
  // registration: UserEventRegistrationType,
  // accessToken: string
  registration,
  accessToken
) => {
  return fetcher.post('/v3/registrations/', registration, {
    accessToken: accessToken,
  });
};

export const getRegistrationsForEvent = async (
  eventId,
  accessToken
) => {
  return fetcher.get(
    '/v3/registrations?' +
    new URLSearchParams({
      eventId: eventId.toString(),
      includeUserInfo: 'true',
    }),
    {
      accessToken: accessToken,
    }
  );
};

export const getRegistrationById = async (
  registrationId,
  accessToken
) => {
  return fetcher.get(
    '/v3/registrations/' +
    registrationId +
    '?' +
    new URLSearchParams({ includeUserinfo: 'true' }),
    {
      accessToken: accessToken,
    }
  );
};

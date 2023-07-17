import { fetcher } from './fetcher';
// import { EventType, UserType, UserEventRegistrationType } from 'types';
import { UserEventRegistrationType } from 'types';

export const registerForEvent = async (
  registration: UserEventRegistrationType,
  accessToken: string
) => {
  return fetcher.post('/v3/registrations/', registration, {
    accessToken: accessToken,
  });
};

export const getRegistrationsForEvent = async (
  eventId: number,
  accessToken: string
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
  registrationId: number,
  accessToken: string
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

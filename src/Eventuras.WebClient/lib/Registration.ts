import { fetcher } from '@lib/fetcher';

export interface UserEventRegistration {
  userId: string;
  eventId: string;
}

export const registerForEvent = async (
  registration: UserEventRegistration,
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

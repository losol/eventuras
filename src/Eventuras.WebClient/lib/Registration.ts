import { EventInfo } from '@lib/EventInfo';
import { fetcher } from '@lib/fetcher';
import { User } from '@lib/User';

export interface UserEventRegistration {
  userId: string;
  eventId: string;
}

export interface Registration {
  registrationId: number;
  eventId: number;
  userId: string;
  status: string;
  type: string;
  certificateId: number;
  notes: string;
  user?: User;
  event?: EventInfo;
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

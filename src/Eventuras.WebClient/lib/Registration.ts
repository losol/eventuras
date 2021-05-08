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

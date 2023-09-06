import { getQueryString } from './utils';

const localApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const apiVersion = process.env.NEXT_PUBLIC_API_VERSION;
const aUri = `${localApiUrl}/${apiVersion}`;

type ByEventId = {
  eventId: string;
};

type ByRegistrationId = {
  registrationId: string;
};

type byUserId = {
  userId: string;
};

const ApiURLs = {
  userprofile: () => `${aUri}/users/me`,
  registrations: () => `${aUri}/registrations`,
  events: (options: Record<string, any> = {}) => `${aUri}/events${getQueryString(options)}`,
  event: ({ eventId }: ByEventId) => `${aUri}/events/${eventId}`,
  eventProducts: ({ eventId }: ByEventId) => `${aUri}/events/${eventId}/products`,
  products: ({ registrationId }: ByRegistrationId) =>
    `${aUri}/registrations/${registrationId}/products`,
  users: (options: Record<string, any> = {}) => `${aUri}/users${getQueryString(options)}`,
  userRegistrations: ({ userId }: byUserId) =>
    `${aUri}/registrations?UserId=${userId}&includeEventInfo=true&includeProducts=true`,
};

export default ApiURLs;

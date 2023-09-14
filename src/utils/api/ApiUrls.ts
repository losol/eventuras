import Environment from '../Environment';
import { getQueryString } from './utils';
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
  rootUri: () => `${Environment.NEXT_PUBLIC_API_BASE_URL}/${Environment.NEXT_PUBLIC_API_VERSION}`,
  userprofile: () => `${ApiURLs.rootUri()}/users/me`,
  registrations: () => `${ApiURLs.rootUri()}/registrations`,
  events: (options: Record<string, any> = {}) =>
    `${ApiURLs.rootUri()}/events${getQueryString(options)}`,
  event: ({ eventId }: ByEventId) => `${ApiURLs.rootUri()}/events/${eventId}`,
  eventProducts: ({ eventId }: ByEventId) => `${ApiURLs.rootUri()}/events/${eventId}/products`,
  products: ({ registrationId }: ByRegistrationId) =>
    `${ApiURLs.rootUri()}/registrations/${registrationId}/products`,
  users: (options: Record<string, any> = {}) =>
    `${ApiURLs.rootUri()}/users${getQueryString(options)}`,
  userRegistrations: ({ userId }: byUserId) =>
    `${ApiURLs.rootUri()}/registrations?UserId=${userId}&includeEventInfo=true&includeProducts=true`,
};

export default ApiURLs;

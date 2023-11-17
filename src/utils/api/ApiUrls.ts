import Environment from '../Environment';
import { getQueryString } from './utils';
type ByEventId = {
  eventId: number;
};

type ByRegistrationId = {
  registrationId: string;
};

type byUserId = {
  userId: string;
};

type byOrgId = {
  orgId: number;
};

type KeyValueOptions = Record<string, any>;

const ApiURLs = {
  rootUri: () => `${Environment.NEXT_PUBLIC_API_BASE_URL}/${Environment.NEXT_PUBLIC_API_VERSION}`,
  userprofile: () => `${ApiURLs.rootUri()}/users/me`,
  registrations: () => `${ApiURLs.rootUri()}/registrations`,
  events: (options: KeyValueOptions = {}) =>
    `${ApiURLs.rootUri()}/events${getQueryString(options)}`,
  event: ({ eventId }: ByEventId) => `${ApiURLs.rootUri()}/events/${eventId}`,
  eventProducts: ({ eventId }: ByEventId) => `${ApiURLs.rootUri()}/events/${eventId}/products`,
  eventRegistrations: (options: KeyValueOptions = {}) =>
    `${ApiURLs.rootUri()}/registrations${getQueryString(options)}`,
  products: ({ registrationId }: ByRegistrationId) =>
    `${ApiURLs.rootUri()}/registrations/${registrationId}/products`,
  users: (options: KeyValueOptions = {}) => `${ApiURLs.rootUri()}/users${getQueryString(options)}`,
  userRegistrations: ({ userId }: byUserId) =>
    `${ApiURLs.rootUri()}/registrations?UserId=${userId}&includeEventInfo=true&includeProducts=true`,
  sendEmailNotification: ({ orgId }: byOrgId) =>
    `${ApiURLs.rootUri()}/notifications/email?orgId=${orgId}`,
};

export default ApiURLs;

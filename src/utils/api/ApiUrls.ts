const localApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const apiVersion = process.env.NEXT_PUBLIC_API_VERSION;
const aUri = `${localApiUrl}/${apiVersion}`;

const ApiURLs = {
  userprofile: `${aUri}/users/me`,
  registrations: `${aUri}/registrations`,
  events: `${aUri}/events`,
  event: (eventId: string) => `${aUri}/events/${eventId}`,
  eventProducts: (eventId: string) => `${aUri}/events/${eventId}/products`,
  products: (registrationId: string) => `${aUri}/registrations/${registrationId}/products`,
};

export default ApiURLs;

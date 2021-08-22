import { fetcher } from './fetcher';

export const getEvents = async (
  organizationId: number,
  accessToken: string
) => {
  return await fetcher.get(
    '/v3/events?' +
      new URLSearchParams({ organizationId: organizationId.toString() }),
    {
      accessToken: accessToken,
    }
  );
};

export const getEventInfo = async (
  eventInfoId: number,
  accessToken: string
) => {
  return await fetcher.get('/v3/events/' + eventInfoId, {
    accessToken: accessToken,
  });
};

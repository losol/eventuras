import { fetcher } from './fetcher';
// import { EventType } from 'types';

export const getEvents = async (
  organizationId: number,
  accessToken: string
) => {
  return fetcher.get(
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
  return fetcher.get('/v3/events/' + eventInfoId, {
    accessToken: accessToken,
  });
};

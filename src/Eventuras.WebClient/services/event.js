import { fetcher } from './fetcher';
// import { EventType } from 'types';

export const getEvents = async (
  organizationId,
  accessToken
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
  eventInfoId,
  accessToken
) => {
  return fetcher.get('/v3/events/' + eventInfoId, {
    accessToken: accessToken,
  });
};

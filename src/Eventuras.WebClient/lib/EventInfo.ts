import { fetcher } from './fetcher';

export const getEventInfo = async (
  eventInfoId: number,
  accessToken: string
) => {
  return await fetcher.get('/v3/events/' + eventInfoId, {
    accessToken: accessToken,
  });
};

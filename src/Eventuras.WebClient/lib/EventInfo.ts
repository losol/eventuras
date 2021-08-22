import { fetcher } from './fetcher';

export interface EventInfo {
  id: number;
  type: string;
  status: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  featured: boolean;
  program: string;
  practicalInformation: string;
  location: string;
  city: string;
  onDemand: boolean;
  dateStart: string;
  dateEnd: string;
  lastRegistrationDate: string;
}

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

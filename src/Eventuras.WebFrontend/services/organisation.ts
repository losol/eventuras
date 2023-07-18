import { fetcher } from './fetcher';

export const getOrganisationSettings = async (
  organisationId: number,
  accessToken: string
) => {
  return fetcher.get(`/v3/organizations/${organisationId}/settings`, {
    accessToken: accessToken,
  });
};

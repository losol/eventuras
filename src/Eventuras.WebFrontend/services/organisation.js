import { fetcher } from './fetcher';

export const getOrganisationSettings = async (
  organisationId,
  accessToken
) => {
  return fetcher.get(`/v3/organizations/${organisationId}/settings`, {
    accessToken: accessToken,
  });
};

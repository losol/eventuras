import { fetcher } from '@lib/fetcher';

export interface OrganisationSetting {
  name: string;
  section: string;
  description: string;
  type: string;
  value: string;
}

export const getOrganisationSettings = async (
  organisationId: number,
  accessToken: string
) => {
  return fetcher.get(`/v3/organizations/${organisationId}/settings`, {
    accessToken: accessToken,
  });
};

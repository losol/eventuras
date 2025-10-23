import { getTranslations } from 'next-intl/server';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import { getV3OrganizationsByOrganizationId, getV3Users } from '@/lib/eventuras-sdk';

import { OrganizationDetails } from './OrganizationDetails';
import OrganizationMemberships from './OrganizationMemberships';

type EventInfoProps = {
  params: Promise<{ id: number }>;
};
/** Shape from backend (selected fields) */
interface Organization {
  organizationId: number;
  name: string;
  description?: string | null;
  url?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  logoBase64?: string | null;
}
/** Server page for /admin/organizations/[id] */
const OrganizationDetailPage: React.FC<EventInfoProps> = async props => {
  // read route params
  const params = await props.params;
  // i18n
  const t = await getTranslations();
  // fetch org
  const organization = await getV3OrganizationsByOrganizationId({
    path: {
      organizationId: params.id,
    },
  });
  // fetch org member
  const members = await getV3Users({
    query: {
      OrganizationId: params.id,
      IncludeOrgMembership: true,
    },
  });
  // render
  return (
    <>
      <Section container>
        <Heading as="h1">{organization.data?.name}</Heading>
      </Section>
      <Section className="py-12" container>
        <OrganizationDetails org={organization.data as Organization} />
      </Section>
      <Section container>
        <Heading as="h2" padding="py-3">
          Organization members
        </Heading>
        <OrganizationMemberships
          organizationId={organization.data?.organizationId!}
          organizationName={organization.data?.name ?? ''}
          members={members.data?.data ?? []}
        />
      </Section>
    </>
  );
};
export default OrganizationDetailPage;

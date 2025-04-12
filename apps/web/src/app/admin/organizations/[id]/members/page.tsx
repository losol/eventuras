import { Container, Heading, Section } from '@eventuras/ui';
import { Logger } from '@eventuras/utils';
import { getTranslations } from 'next-intl/server';

import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import { getAccessToken } from '@/utils/getAccesstoken';
import { oauthConfig } from '@/utils/oauthConfig';

type EventInfoProps = {
  params: {
    id: number;
  };
};

const OrganizationDetailPage: React.FC<EventInfoProps> = async ({ params }) => {
  const t = await getTranslations();

  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: await getAccessToken(),
  });

  const organization = await apiWrapper(() =>
    eventuras.organizations.getV3Organizations1({
      organizationId: params.id,
    })
  );

  const organizationMembers = await apiWrapper(() =>
    eventuras.users.getV3Users1({
      organizationId: params.id,
      includeOrgMembership: true,
    })
  );

  if (!organization.ok) {
    Logger.error(
      { namespace: 'EditEventinfo' },
      `Failed to fetch order id ${params.id}, error: ${organization.error}`
    );
  }

  if (!organization.ok) {
    return <div>{t('admin.organizations.labels.notFound')}</div>;
  }

  return (
    <>
      <Section className="bg-white dark:bg-black   pb-8">
        <Container>
          <Heading as="h1">{organization.value?.name} members</Heading>
        </Container>
      </Section>
      <Section className="py-12">
        <Container>
          <pre>{JSON.stringify(organizationMembers.value!, null, 4)}</pre>
        </Container>
      </Section>
    </>
  );
};

export default OrganizationDetailPage;

import { Container } from '@eventuras/ui';
import { Heading } from '@eventuras/ui';
import { Section } from '@eventuras/ui';
import { Logger } from '@eventuras/utils';
import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';

type EventInfoProps = {
  params: {
    id: number;
  };
};

const OrganizationDetailPage: React.FC<EventInfoProps> = async ({ params }) => {
  const { t } = createTranslation();

  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: headers().get('Authorization'),
  });

  const organization = await apiWrapper(() =>
    eventuras.organizations.getV3Organizations1({
      organizationId: params.id,
    })
  );

  if (!organization.ok) {
    Logger.error(
      { namespace: 'EditEventinfo' },
      `Failed to fetch order id ${params.id}, error: ${organization.error}`
    );
  }

  if (!organization.ok) {
    return <div>{t('admin:organizations.labels.notFound')}</div>;
  }

  return (
    <Wrapper>
      <Section className="bg-white dark:bg-black   pb-8">
        <Container>
          <Heading as="h1">{organization.value?.name}</Heading>
        </Container>
      </Section>
      <Section className="py-12">
        <Container>
          <pre>{JSON.stringify(organization.value!, null, 4)}</pre>
        </Container>
      </Section>
    </Wrapper>
  );
};

export default OrganizationDetailPage;

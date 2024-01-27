import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import { Container, Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import Section from '@/components/ui/Section';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';

import Registration from '../Registration';

type EventInfoProps = {
  params: {
    id: number;
  };
};
const RegistrationDetailPage: React.FC<EventInfoProps> = async ({ params }) => {
  const { t } = createTranslation();

  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: headers().get('Authorization'),
  });

  const registration = await apiWrapper(() =>
    eventuras.registrations.getV3Registrations1({
      id: params.id,
      includeEventInfo: true,
      includeProducts: true,
      includeUserInfo: true,
    })
  );

  Logger.debug(
    { namespace: 'admin:registrations' },
    `Registration detail page: with data ${JSON.stringify(registration.value)}`
  );

  if (!registration.ok) {
    Logger.error(
      { namespace: 'admin:registrations' },
      `Failed to fetch order id ${params.id}, error: ${registration.error}`
    );
    return <div>{t('admin:registrations.labels.notFound')}</div>;
  }

  return (
    <Layout fluid>
      <Section className="bg-white dark:bg-black pb-8">
        <Container>
          <Heading as="h1">{t('admin:registrations.detailsPage.title')}</Heading>
        </Container>
      </Section>
      <Section className="py-12">
        <Container>
          <Registration registration={registration.value!} adminMode />
        </Container>
      </Section>
    </Layout>
  );
};

export default RegistrationDetailPage;

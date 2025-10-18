import { Container, Heading, Section } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/logger';
import { getTranslations } from 'next-intl/server';

import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { publicEnv } from '@/config.client';
import { getAccessToken } from '@/utils/getAccesstoken';

import Registration from '../Registration';

type EventInfoProps = {
  params: Promise<{
    id: number;
  }>;
};
const RegistrationDetailPage: React.FC<EventInfoProps> = async props => {
  const params = await props.params;
  const t = await getTranslations();

  const eventuras = createSDK({
    baseUrl: publicEnv.NEXT_PUBLIC_BACKEND_URL as string,
    authHeader: await getAccessToken(),
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
    { namespace: 'common:registrations' },
    `Registration detail page: with data ${JSON.stringify(registration.value)}`
  );

  if (!registration.ok) {
    Logger.error(
      { namespace: 'common:registrations' },
      `Failed to fetch order id ${params.id}, error: ${registration.error}`
    );
    return <div>{t('common.registrations.labels.notFound')}</div>;
  }

  return (
    <>
      <Section className="bg-white dark:bg-black pb-8">
        <Container>
          <Heading as="h1">{t('common.registrations.detailsPage.title')}</Heading>
        </Container>
      </Section>
      <Section className="py-12">
        <Container>
          <Registration registration={registration.value!} adminMode />
        </Container>
      </Section>
    </>
  );
};

export default RegistrationDetailPage;

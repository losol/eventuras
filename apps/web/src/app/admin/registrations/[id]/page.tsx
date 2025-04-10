import { Container, Heading, Section } from '@eventuras/ui';
import { Logger } from '@eventuras/utils';
import createTranslation from 'next-translate/createTranslation';

import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { authConfig } from '@/utils/authconfig';
import Environment from '@/utils/Environment';
import { getAccessToken } from '@/utils/getAccesstoken';

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
    return <div>{t('common:registrations.labels.notFound')}</div>;
  }

  return (
    <>
      <Section className="bg-white dark:bg-black pb-8">
        <Container>
          <Heading as="h1">{t('common:registrations.detailsPage.title')}</Heading>
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

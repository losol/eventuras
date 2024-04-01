import { Container } from '@eventuras/ui';
import { Heading } from '@eventuras/ui';
import { Section } from '@eventuras/ui';
import { Logger } from '@eventuras/utils';
import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';

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

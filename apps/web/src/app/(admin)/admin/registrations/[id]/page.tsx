import { getTranslations } from 'next-intl/server';

import { getV3RegistrationsById } from '@eventuras/event-sdk';
import { Logger } from '@eventuras/logger';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import Registration from '../Registration';

type EventInfoProps = {
  params: Promise<{
    id: number;
  }>;
};
const RegistrationDetailPage: React.FC<EventInfoProps> = async props => {
  const params = await props.params;
  const t = await getTranslations();
  const response = await getV3RegistrationsById({
    path: { id: params.id },
    query: {
      IncludeEventInfo: true,
      IncludeProducts: true,
      IncludeUserInfo: true,
    },
  });
  Logger.debug(
    { namespace: 'common:registrations' },
    `Registration detail page: with data ${JSON.stringify(response.data)}`
  );
  if (!response.data) {
    Logger.error(
      { namespace: 'common:registrations' },
      `Failed to fetch registration id ${params.id}, error: ${response.error}`
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
          <Registration registration={response.data} adminMode />
        </Container>
      </Section>
    </>
  );
};
export default RegistrationDetailPage;

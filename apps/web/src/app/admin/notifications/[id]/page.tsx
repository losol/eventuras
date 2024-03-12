import { Container } from '@eventuras/ui';
import Heading from '@eventuras/ui/Heading';
import Section from '@eventuras/ui/Section';
import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';

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

  const notification = await apiWrapper(() =>
    eventuras.notifications.getV3Notifications({
      id: params.id,
    })
  );

  const notificationRecipients = await apiWrapper(() =>
    eventuras.notificationRecipients.getV3NotificationsRecipients({
      id: params.id,
    })
  );

  if (!notification.ok) {
    Logger.error(
      { namespace: 'notifications' },
      `Failed to fetch notification id ${params.id}, error: ${notification.error}`
    );
  }

  if (!notification.ok) {
    return <div>{t('admin:organizations.labels.notFound')}</div>;
  }

  return (
    <Wrapper fluid>
      <Section className="bg-white dark:bg-black   pb-8">
        <Container>
          <Heading as="h1">Notification</Heading>
        </Container>
      </Section>
      <Section className="py-12">
        <Container>
          <pre>{JSON.stringify(notification.value!, null, 4)}</pre>
          <hr />
          <pre>{JSON.stringify(notificationRecipients.value!, null, 4)}</pre>
        </Container>
      </Section>
    </Wrapper>
  );
};

export default OrganizationDetailPage;

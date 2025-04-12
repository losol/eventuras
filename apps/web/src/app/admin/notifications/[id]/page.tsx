import { Container, Heading, Section } from '@eventuras/ui';
import { Logger } from '@eventuras/utils';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import { getAccessToken } from '@/utils/getAccesstoken';

type EventInfoProps = {
  params: {
    id: number;
  };
};

const OrganizationDetailPage: React.FC<EventInfoProps> = async props => {
  const params = await props.params;
  const t = await getTranslations();

  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: await getAccessToken(),
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
    return <div>{t('admin.organizations.labels.notFound')}</div>;
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

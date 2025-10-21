import { Container, Heading, Section } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/logger';
import { getTranslations } from 'next-intl/server';

import { getV3NotificationsById, getV3NotificationsByIdRecipients } from '@eventuras/event-sdk';

type EventInfoProps = {
  params: Promise<{
    id: number;
  }>;
};

const NotificationDetailPage: React.FC<EventInfoProps> = async props => {
  const params = await props.params;
  const t = await getTranslations();

  const notificationResponse = await getV3NotificationsById({
    path: { id: params.id },
  });

  const recipientsResponse = await getV3NotificationsByIdRecipients({
    path: { id: params.id },
  });

  if (!notificationResponse.data) {
    Logger.error(
      { namespace: 'notifications' },
      `Failed to fetch notification id ${params.id}, error: ${notificationResponse.error}`
    );
    return <div>{t('admin.organizations.labels.notFound')}</div>;
  }

  return (
    <>
      <Section className="bg-white dark:bg-black   pb-8">
        <Container>
          <Heading as="h1">Notification</Heading>
        </Container>
      </Section>
      <Section className="py-12">
        <Container>
          <pre>{JSON.stringify(notificationResponse.data, null, 4)}</pre>
          <hr />
          <pre>{JSON.stringify(recipientsResponse.data, null, 4)}</pre>
        </Container>
      </Section>
    </>
  );
};

export default NotificationDetailPage;

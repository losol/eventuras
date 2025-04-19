import { NotificationDto } from '@eventuras/sdk';
import { Container, Heading, Section, Text } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/utils';

import Card from '@/components/Card';
import Wrapper from '@/components/eventuras/Wrapper';
import Link from '@/components/Link';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import { getAccessToken } from '@/utils/getAccesstoken';

type NotificationPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function NotificationsPage({ searchParams }: NotificationPageProps) {
  const { id } = await searchParams;

  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: await getAccessToken(),
  });

  const notifications = await apiWrapper(() => {
    if (id) {
      return eventuras.notifications.getV3Notifications1({
        eventId: parseInt(id as string),
        eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID),
      });
    } else {
      return eventuras.notifications.getV3Notifications1({
        eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID),
      });
    }
  });

  Logger.info({ namespace: 'notifications' }, `Notifications: ${JSON.stringify(notifications)}`);

  if (!notifications.ok) {
    Logger.error(
      { namespace: 'notifications' },
      `Failed to fetch notifications, error: ${notifications.error}`
    );
  }

  return (
    <Wrapper fluid>
      <Section className="bg-white dark:bg-black   pb-8">
        <Container>
          <Heading as="h1">Notifications</Heading>
          {id && (
            <Link href={`/admin/events/${id}`} variant="button-primary">
              Event page
            </Link>
          )}
        </Container>
      </Section>
      <Section className="py-12">
        <Container>
          {notifications.value.total == 0 && <Text>No notifications.. yet..</Text>}
          {notifications.value &&
            notifications.value.data.map((notification: NotificationDto) => {
              return (
                <Card key={notification.notificationId}>
                  <Text>{notification.status}</Text>
                  <Text>{notification.message}</Text>
                  <Link href={`/admin/notifications/${notification.notificationId}`}>Details</Link>
                </Card>
              );
            })}
        </Container>
      </Section>
    </Wrapper>
  );
}

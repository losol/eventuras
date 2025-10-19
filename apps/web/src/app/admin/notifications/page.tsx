import { NotificationDto } from '@eventuras/sdk';
import { Container, Heading, Section, Text } from '@eventuras/ratio-ui';
// import { Logger } from '@eventuras/logger';

import { Card } from '@eventuras/ratio-ui/core/Card';
import Wrapper from '@/components/eventuras/Wrapper';
import { Link } from '@eventuras/ratio-ui-next/Link';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { appConfig } from '@/config.server';
import { getAccessToken } from '@/utils/getAccesstoken';

type NotificationPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function NotificationsPage({ searchParams }: NotificationPageProps) {
  const { id } = await searchParams;

  const eventuras = createSDK({
    baseUrl: appConfig.env.NEXT_PUBLIC_BACKEND_URL as string,
    authHeader: await getAccessToken(),
  });

  // Get organization ID with proper type handling
  const organizationId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;
  if (!organizationId || typeof organizationId !== 'number') {
    throw new Error('NEXT_PUBLIC_ORGANIZATION_ID is not configured properly');
  }

  const notifications = await apiWrapper(() => {
    if (id) {
      return eventuras.notifications.getV3Notifications1({
        eventId: parseInt(id as string),
        eventurasOrgId: organizationId,
      });
    } else {
      return eventuras.notifications.getV3Notifications1({
        eventurasOrgId: organizationId,
      });
    }
  });

  // Logger.info({ namespace: 'notifications' }, `Notifications: ${JSON.stringify(notifications)}`);

  if (!notifications.ok) {
    // Logger.error(
    //   { namespace: 'notifications' },
    //   `Failed to fetch notifications, error: ${notifications.error}`
    // );
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

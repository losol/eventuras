import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { appConfig } from '@/config.server';
import { NotificationDto } from "@/lib/eventuras-sdk";
import { getV3Notifications } from "@/lib/eventuras-sdk";
type NotificationPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
type NotificationListResponse = {
  total: number;
  data: NotificationDto[];
};
export default async function NotificationsPage({ searchParams }: NotificationPageProps) {
  const { id } = await searchParams;
  // Get organization ID with proper type handling
  const organizationId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;
  if (!organizationId || typeof organizationId !== 'number') {
    throw new Error('NEXT_PUBLIC_ORGANIZATION_ID is not configured properly');
  }
  const response = await getV3Notifications({
    headers: {
      'Eventuras-Org-Id': organizationId,
    },
    query: id
      ? {
          EventId: parseInt(id as string),
        }
      : undefined,
  });
  const notificationData = response.data as NotificationListResponse;
  if (!response.data) {
    return (
      <Section className="bg-white dark:bg-black pb-8">
        <Container>
          <Heading as="h1">Notifications</Heading>
          <Text>Failed to load notifications</Text>
        </Container>
      </Section>
    );
  }
  return (
    <>
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
          {notificationData?.total === 0 && <Text>No notifications.. yet..</Text>}
          {notificationData?.data?.map((notification: NotificationDto) => {
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
    </>
  );
}

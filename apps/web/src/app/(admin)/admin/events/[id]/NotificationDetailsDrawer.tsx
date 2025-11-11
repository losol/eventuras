'use client';

import { useEffect, useState } from 'react';

import { formatDate } from '@eventuras/core/datetime';
import { Logger } from '@eventuras/logger';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Loading } from '@eventuras/ratio-ui/core/Loading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';

import { NotificationDto } from '@/lib/eventuras-sdk';

import { fetchNotificationRecipients, RecipientDto } from './notificationActions';

const logger = Logger.create({
  namespace: 'web:admin:events',
  context: { module: 'NotificationDetailsDrawer' },
});

type NotificationDetailsDrawerProps = {
  notification: NotificationDto;
  isOpen: boolean;
  onClose: () => void;
};

export default function NotificationDetailsDrawer({
  notification,
  isOpen,
  onClose,
}: NotificationDetailsDrawerProps) {
  const [recipients, setRecipients] = useState<RecipientDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !notification.notificationId) {
      return;
    }

    let cancelled = false;

    async function fetchRecipients() {
      logger.info(
        { notificationId: notification.notificationId },
        'Fetching notification recipients'
      );

      try {
        const result = await fetchNotificationRecipients(notification.notificationId!);

        if (cancelled) return;

        if (result.success) {
          setRecipients(result.data);
          logger.info(
            { notificationId: notification.notificationId, count: result.data.length },
            'Recipients loaded'
          );
        } else {
          logger.error(
            { notificationId: notification.notificationId, error: result.error },
            'Failed to load recipients'
          );
        }
      } catch (error) {
        if (cancelled) return;
        logger.error(
          { notificationId: notification.notificationId, error },
          'Error loading recipients'
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    setIsLoading(true);
    fetchRecipients();

    return () => {
      cancelled = true;
    };
  }, [isOpen, notification.notificationId]);

  return (
    <Drawer isOpen={isOpen} onCancel={onClose}>
      <Drawer.Header as="h3" className="text-black">
        Notification Details
      </Drawer.Header>
      <Drawer.Body>
        <div className="space-y-6">
          {/* Notification Overview */}
          <div className="space-y-3">
            <div>
              <Text className="font-semibold text-sm text-gray-600">Type</Text>
              <Text>{notification.type || '-'}</Text>
            </div>
            <div>
              <Text className="font-semibold text-sm text-gray-600">Status</Text>
              <Text>{notification.status || '-'}</Text>
            </div>
            <div>
              <Text className="font-semibold text-sm text-gray-600">Created</Text>
              <Text>
                {notification.created
                  ? formatDate(notification.created.toString(), { showTime: true })
                  : '-'}
              </Text>
            </div>
            <div>
              <Text className="font-semibold text-sm text-gray-600">Message</Text>
              <Text className="whitespace-pre-wrap">{notification.message || '-'}</Text>
            </div>
          </div>

          {/* Statistics */}
          {notification.statistics && (
            <div className="border-t pt-4">
              <Text className="font-semibold mb-3">Statistics</Text>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Text className="text-sm text-gray-600">Recipients</Text>
                  <Text className="text-2xl font-bold">
                    {notification.statistics.recipients || 0}
                  </Text>
                </div>
                <div>
                  <Text className="text-sm text-gray-600">Sent</Text>
                  <Text className="text-2xl font-bold text-green-600">
                    {notification.statistics.sent || 0}
                  </Text>
                </div>
                <div>
                  <Text className="text-sm text-gray-600">Errors</Text>
                  <Text className="text-2xl font-bold text-red-600">
                    {notification.statistics.errors || 0}
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* Recipients List */}
          <div className="border-t pt-4">
            <Text className="font-semibold mb-3">Recipients</Text>
            {isLoading ? (
              <Loading />
            ) : recipients.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recipients.map((recipient, index) => {
                  const badgeVariant = recipient.sent
                    ? 'positive'
                    : recipient.errors
                      ? 'negative'
                      : 'neutral';
                  const badgeLabel = recipient.sent
                    ? 'Sent'
                    : recipient.errors
                      ? 'Error'
                      : 'Pending';

                  return (
                    <Card key={recipient.notificationRecipientId || index} padding="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Text className="font-medium">
                            {recipient.recipientName || 'Unknown'}
                          </Text>
                          <Text className="text-sm text-gray-600">
                            {recipient.recipientEmail || recipient.recipientPhoneNumber || '-'}
                          </Text>
                        </div>
                        <Badge variant={badgeVariant}>{badgeLabel}</Badge>
                      </div>
                      {recipient.errors && (
                        <Text className="text-xs text-red-600 mt-2">{recipient.errors}</Text>
                      )}
                      {recipient.sent && (
                        <Text className="text-xs text-gray-500 mt-1">
                          Sent: {formatDate(recipient.sent.toString(), { showTime: true })}
                        </Text>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Text className="text-gray-500">No recipients data available</Text>
            )}
          </div>
        </div>
      </Drawer.Body>
      <Drawer.Footer>
        <></>
      </Drawer.Footer>
    </Drawer>
  );
}

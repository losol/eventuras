'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { formatDate } from '@eventuras/core/datetime';
import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { Button } from '@eventuras/ratio-ui/core/Button';

import { NotificationDto } from '@/lib/eventuras-sdk';

import NotificationDetailsDrawer from './NotificationDetailsDrawer';

const columnHelper = createColumnHelper<NotificationDto>();

type NotificationsTableProps = {
  notifications: NotificationDto[];
};

export default function NotificationsTable({ notifications }: NotificationsTableProps) {
  const t = useTranslations();
  const [selectedNotification, setSelectedNotification] = useState<NotificationDto | null>(null);

  const columns = [
    columnHelper.accessor('created', {
      header: t('common.labels.created').toString(),
      cell: info => {
        const value = info.getValue();
        return value ? formatDate(value.toString(), { showTime: true }) : '-';
      },
    }),
    columnHelper.accessor('type', {
      header: t('common.labels.type').toString(),
      cell: info => info.getValue() || '-',
    }),
    columnHelper.accessor('status', {
      header: t('common.labels.status').toString(),
      cell: info => info.getValue() || '-',
    }),
    columnHelper.accessor('message', {
      header: t('common.labels.message').toString(),
      cell: info => info.getValue() || '-',
    }),
    columnHelper.accessor('statistics', {
      header: t('common.labels.recipients').toString(),
      cell: info => {
        const stats = info.getValue();
        if (!stats) return '-';
        const sent = stats.sent || 0;
        const total = stats.recipients || 0;
        return `${sent}/${total}`;
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: t('admin.eventColumns.actions').toString(),
      cell: info => (
        <Button variant="outline" onClick={() => setSelectedNotification(info.row.original)}>
          {t('common.labels.view')}
        </Button>
      ),
    }),
  ];

  if (notifications.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        {t('admin.notifications.noNotifications')}
      </div>
    );
  }

  return (
    <>
      <DataTable data={notifications} columns={columns} pageSize={10} />

      {selectedNotification && (
        <NotificationDetailsDrawer
          notification={selectedNotification}
          isOpen={!!selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </>
  );
}

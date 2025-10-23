'use client';

import { useTranslations } from 'next-intl';

import {
  sendEmailNotification,
  sendSmsNotification,
} from '@/app/(admin)/admin/actions/notifications';
import type {
  EmailNotificationDto,
  EventParticipantsFilterDto,
  SmsNotificationDto,
} from '@/lib/eventuras-types';
import { RegistrationStatus, RegistrationType } from '@/lib/eventuras-types';
import { ParticipationTypes } from '@/types';
import { participationMap } from '@/utils/api/mappers';
import { mapEnum } from '@/utils/enum';

import Notificator, {
  FilterGroup,
  NotificationType,
} from './Notificator';

type EventFormValues = {
  subject: string;
  body: string;
  registrationStatus: Record<string, boolean>;
  registrationTypes: Record<string, boolean>;
};

export type EventNotificatorProps = {
  eventTitle: string;
  eventId: number;
  notificationType: NotificationType;
  onClose: () => void;
};

/**
 * Event Notificator - Specialized wrapper for sending notifications to event participants
 *
 * Uses the generic Notificator component with event-specific configuration.
 */
export default function EventNotificator({
  eventTitle,
  eventId,
  notificationType,
  onClose,
}: EventNotificatorProps) {
  const t = useTranslations();

  // Build filter groups for event participants
  const filterGroups: FilterGroup[] = [
    {
      name: 'registrationStatus',
      label: t('admin.eventNotifier.form.status.label'),
      options: Object.keys(participationMap).map(status => ({
        id: status,
        label: t(`admin.eventNotifier.form.status.${status}`),
        defaultChecked: status === ParticipationTypes.active,
      })),
    },
    {
      name: 'registrationTypes',
      label: t('admin.eventNotifier.form.type.label'),
      options: mapEnum(RegistrationType, type => ({
        id: String(type),
        label: String(type),
        defaultChecked: type === RegistrationType.PARTICIPANT,
      })),
    },
  ];

  // Transform form data to notification DTO
  const transformFormData = (
    formData: Record<string, unknown>
  ): EmailNotificationDto | SmsNotificationDto => {
    const data = formData as EventFormValues;
    // Convert checkbox maps to arrays with correct enum types
    const regStatusKeys = Object.keys(data.registrationStatus || {}).filter(
      k => data.registrationStatus[k]
    );

    const registrationStatuses: RegistrationStatus[] = regStatusKeys.flatMap(key => {
      const k = key as keyof typeof participationMap;
      const values = (participationMap[k] as unknown as string[]) || [];
      return values.map(v => {
        const fromEnum = (RegistrationStatus as Record<string, unknown>)[v];
        if (fromEnum !== undefined) return fromEnum as RegistrationStatus;
        const num = Number(v);
        return !Number.isNaN(num)
          ? (num as unknown as RegistrationStatus)
          : (v as unknown as RegistrationStatus);
      });
    });

    const registrationTypes: RegistrationType[] = Object.keys(data.registrationTypes || {})
      .filter(k => data.registrationTypes[k])
      .map(k => {
        const num = Number(k);
        if (!Number.isNaN(num) && Object.values(RegistrationType as Record<string, unknown>).includes(num as unknown as RegistrationType)) {
          return num as unknown as RegistrationType;
        }
        return (RegistrationType as Record<string, unknown>)[k] as RegistrationType;
      })
      .filter((v): v is RegistrationType => v !== undefined);

    const eventParticipants: EventParticipantsFilterDto = {
      eventId,
      registrationStatuses,
      registrationTypes,
    };

    return notificationType === NotificationType.EMAIL
      ? { subject: data.subject, bodyMarkdown: data.body, eventParticipants }
      : { message: data.body, eventParticipants };
  };

  // Send notification via appropriate server action
  const sendNotification = async (dto: EmailNotificationDto | SmsNotificationDto) => {
    return notificationType === NotificationType.EMAIL
      ? await sendEmailNotification(dto as EmailNotificationDto)
      : await sendSmsNotification(dto as SmsNotificationDto);
  };

  return (
    <Notificator
      title={`${t('common.events.event')}: ${eventTitle}`}
      notificationType={notificationType}
      filterGroups={filterGroups}
      transformFormData={transformFormData}
      sendNotification={sendNotification}
      onClose={onClose}
    />
  );
}

export { NotificationType };

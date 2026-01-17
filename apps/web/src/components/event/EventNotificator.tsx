'use client';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { Button, ButtonGroup } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { MarkdownInput } from '@eventuras/scribo';
import { CheckboxInput, CheckboxLabel, Form, TextField } from '@eventuras/smartform';
import { useToast } from '@eventuras/toast';

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

import '@eventuras/scribo/style.css';
const logger = Logger.create({
  namespace: 'web:components:event',
  context: { component: 'EventNotificator' },
});
type FormValues = {
  subject: string;
  body: string;
  registrationStatus: Record<string, boolean>;
  registrationTypes: Record<string, boolean>;
};
export enum EventNotificatorType {
  EMAIL = 'email',
  SMS = 'sms',
}
export type EventNotificatorProps = {
  eventTitle: string;
  eventId: number;
  notificatorType: EventNotificatorType;
  onClose: () => void;
};
const validateFormData = (data: FormValues, type: EventNotificatorType): string[] => {
  const errs: string[] = [];
  if (!data.body?.trim())
    errs.push(
      type === EventNotificatorType.EMAIL ? 'Email body is required' : 'SMS body is required'
    );
  if (type === EventNotificatorType.EMAIL && !data.subject?.trim())
    errs.push('Email subject is required');
  if (!Object.values(data.registrationStatus || {}).some(Boolean))
    errs.push('Select at least one registration status');
  if (!Object.values(data.registrationTypes || {}).some(Boolean))
    errs.push('Select at least one registration type');
  return errs;
};
const getBodyDto = (
  eventId: number,
  data: FormValues,
  type: EventNotificatorType
): EmailNotificationDto | SmsNotificationDto => {
  // Convert checkbox maps -> arrays with correct enum types
  const regStatusKeys = Object.keys(data.registrationStatus || {}).filter(
    k => data.registrationStatus[k]
  );
  const registrationStatuses: RegistrationStatus[] = regStatusKeys.flatMap(key => {
    const k = key as keyof typeof participationMap;
    // `participationMap[k]` may be an array of strings; coerce each to RegistrationStatus
    const values = (participationMap[k] as unknown as string[]) || [];
    return values.map(v => {
      // Try enum lookup by key/name first
      const fromEnum = (RegistrationStatus as any)[v];
      if (fromEnum !== undefined) return fromEnum as RegistrationStatus;
      // Fallback: numeric-like string to number (for numeric enums)
      const num = Number(v);
      return !Number.isNaN(num)
        ? (num as unknown as RegistrationStatus)
        : (v as unknown as RegistrationStatus);
    });
  });
  const registrationTypes: RegistrationType[] = Object.keys(data.registrationTypes || {})
    .filter(k => data.registrationTypes[k])
    .map(k => {
      // If enum is numeric, keys will be numeric-like strings
      const num = Number(k);
      if (!Number.isNaN(num) && Object.values(RegistrationType as any).includes(num as any)) {
        return num as unknown as RegistrationType;
      }
      // Otherwise treat as enum key/name
      return (RegistrationType as any)[k] as RegistrationType;
    })
    .filter((v): v is RegistrationType => v !== undefined);
  const eventParticipants: EventParticipantsFilterDto = {
    eventId,
    registrationStatuses,
    registrationTypes,
  };
  return type === EventNotificatorType.EMAIL
    ? { subject: data.subject, bodyMarkdown: data.body, eventParticipants }
    : { message: data.body, eventParticipants };
};
// -- Component
export default function EventNotificator({
  eventTitle,
  eventId,
  onClose,
  notificatorType,
}: EventNotificatorProps) {
  const toast = useToast();
  const t = useTranslations();
  const {
    register,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      subject: '',
      body: '',
      registrationStatus: {},
      registrationTypes: {},
    },
  });
  const onSubmitForm: SubmitHandler<FormValues> = async data => {
    try {
      // Validate form data
      const validationErrors = validateFormData(data, notificatorType);
      if (validationErrors.length > 0) {
        logger.warn({ validationErrors }, 'Form validation failed');
        toast.error(validationErrors.join('\n'));
        return;
      }
      // Build notification DTO
      const notificationDto = getBodyDto(eventId, data, notificatorType);
      logger.info(
        {
          notificationType: notificatorType,
          eventId,
          recipientCriteria: {
            statuses: Object.keys(data.registrationStatus || {}).filter(
              k => data.registrationStatus[k]
            ),
            types: Object.keys(data.registrationTypes || {}).filter(k => data.registrationTypes[k]),
          },
        },
        `Sending ${notificatorType} notification`
      );
      // Call appropriate server action
      const result =
        notificatorType === EventNotificatorType.EMAIL
          ? await sendEmailNotification(notificationDto as EmailNotificationDto)
          : await sendSmsNotification(notificationDto as SmsNotificationDto);
      if (!result.success) {
        logger.error(
          {
            error: result.error,
            eventId,
            notificationType: notificatorType,
          },
          `Failed to send ${notificatorType} notification`
        );
        toast.error(result.error.message);
        return;
      }
      logger.info({ eventId }, `Successfully sent ${notificatorType} notification`);
      toast.success(
        result.message ||
          (notificatorType === EventNotificatorType.EMAIL
            ? t('admin.eventNotifier.form.successFeedbackEmail')
            : t('admin.eventNotifier.form.successFeedbackSMS'))
      );
      onClose();
    } catch (error) {
      logger.error(
        { error, eventId, notificationType: notificatorType },
        `Unexpected error in ${notificatorType} handler`
      );
      toast.error('An unexpected error occurred. Please try again.');
    }
  };
  return (
    <Form onSubmit={onSubmitForm} className="text-black w-72">
      <div>
        <Heading as="h4">{t('common.events.event')}</Heading>
        <p>{eventTitle}</p>
      </div>
      {/* Registration Status Selection */}
      <div>
        <p>{t('admin.eventNotifier.form.status.label')}</p>
        {Object.keys(participationMap).map(status => (
          <CheckboxInput
            key={status}
            className="relative z-10"
            id={`status-${status}`}
            {...register(`registrationStatus.${status}`)}
            defaultChecked={status === ParticipationTypes.active}
          >
            <CheckboxLabel>{t(`admin.eventNotifier.form.status.${status}`)}</CheckboxLabel>
          </CheckboxInput>
        ))}
      </div>
      {/* Registration Type Selection */}
      <div>
        <p>{t('admin.eventNotifier.form.type.label')}</p>
        {mapEnum(RegistrationType, type => (
          <CheckboxInput
            key={type}
            className="relative z-10"
            id={`type-${type}`}
            {...register(`registrationTypes.${type}`)}
            defaultChecked={type === RegistrationType.PARTICIPANT}
          >
            <CheckboxLabel>{type}</CheckboxLabel>
          </CheckboxInput>
        ))}
      </div>
      {/* Subject field for emails */}
      {notificatorType === EventNotificatorType.EMAIL && (
        <div>
          <TextField
            name="subject"
            label={t('admin.eventNotifier.form.subject.label')}
            placeholder={t('admin.eventNotifier.form.subject.label')}
          />
        </div>
      )}
      {/* Message body */}
      <div>
        {notificatorType === EventNotificatorType.EMAIL ? (
          <div id="bodyEditor">
            <MarkdownInput
              name="body"
              label={t('admin.eventNotifier.form.body.label')}
              placeholder={t('admin.eventNotifier.form.body.label')}
            />
          </div>
        ) : (
          <TextField
            name="body"
            label={t('eventNotifier.form.body.label')}
            placeholder={t('eventNotifier.form.body.label')}
            multiline
          />
        )}
      </div>
      {/* Actions */}
      <ButtonGroup margin="my-4">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : t('common.buttons.send')}
        </Button>
        <Button
          type="button"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            onClose();
          }}
          variant="secondary"
          disabled={isSubmitting}
        >
          {t('common.buttons.cancel')}
        </Button>
      </ButtonGroup>
    </Form>
  );
}

import { MarkdownInput } from '@eventuras/markdowninput';
import {
  EmailNotificationDto,
  RegistrationType,
  RegistrationStatus,
  SmsNotificationDto,
  EventParticipantsFilterDto,
} from '@eventuras/sdk';
import { CheckboxInput, CheckboxLabel, Form, Input } from '@eventuras/smartform';
import { Button, ButtonGroup, Heading } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/utils/src/Logger';
import { useTranslations } from 'next-intl';
import { SubmitHandler, useForm } from 'react-hook-form';

import { useToast } from '@eventuras/toast';
import { ParticipationTypes } from '@/types';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { participationMap } from '@/utils/api/mappers';
import { mapEnum } from '@/utils/enum';
import Environment from '@/utils/Environment';

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

interface ApiErrorDetails {
  field?: string;
  message: string;
  code?: string;
}
interface FormattedError {
  type: 'validation' | 'network' | 'authentication' | 'server' | 'client' | 'unknown';
  message: string;
  details?: ApiErrorDetails[];
  originalError?: any;
}

const parseApiError = (error: any): FormattedError => {
  if (!error?.body && (error?.message?.includes('fetch') || error?.message?.includes('network'))) {
    return {
      type: 'network',
      message: 'Network connection failed. Please try again.',
      originalError: error,
    };
  }
  if (error?.status === 401 || error?.status === 403) {
    return {
      type: 'authentication',
      message: 'Not authorized. Please log in again.',
      originalError: error,
    };
  }
  if (error?.status === 400 && error?.body?.errors) {
    const details: ApiErrorDetails[] = [];
    Object.entries(error.body.errors).forEach(([field, messages]) => {
      (Array.isArray(messages) ? messages : [messages]).forEach((msg: string) => {
        details.push({ field, message: msg, code: 'validation_error' });
      });
    });
    if (details.length > 0) {
      const fieldMessages = details
        .map(d => `• ${d.field?.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${d.message}`)
        .join('\n');
      return {
        type: 'validation',
        message: `Validation failed:\n${fieldMessages}`,
        details,
        originalError: error,
      };
    }
  }
  if (error?.status >= 500) {
    return { type: 'server', message: 'Server error. Try again shortly.', originalError: error };
  }
  if (error?.status >= 400 && error?.status < 500) {
    const msg = error.body?.message || error.body?.title || `Request failed (${error.status})`;
    return { type: 'client', message: `Request error: ${msg}`, originalError: error };
  }
  return { type: 'unknown', message: error?.message || 'Unexpected error.', originalError: error };
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
      const validationErrors = validateFormData(data, notificatorType);
      if (validationErrors.length > 0) {
        Logger.warn(
          { namespace: 'EventNotificator' },
          `Form validation failed: ${JSON.stringify(validationErrors)}`
        );
        toast.error(validationErrors.join('\n'));
        return;
      }

      const body = getBodyDto(eventId, data, notificatorType);
      const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });

      Logger.info(
        { namespace: 'EventNotificator' },
        `Sending ${notificatorType} notification for event ${eventId}`,
        {
          recipientCriteria: {
            statuses: Object.keys(data.registrationStatus || {}).filter(
              k => data.registrationStatus[k]
            ),
            types: Object.keys(data.registrationTypes || {}).filter(k => data.registrationTypes[k]),
          },
        }
      );

      const result =
        notificatorType === EventNotificatorType.EMAIL
          ? await apiWrapper(() =>
              sdk.notificationsQueueing.postV3NotificationsEmail({
                eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10),
                requestBody: body as EmailNotificationDto,
              })
            )
          : await apiWrapper(() =>
              sdk.notificationsQueueing.postV3NotificationsSms({
                eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10),
                requestBody: body as SmsNotificationDto,
              })
            );

      if (!result.ok) {
        const formatted = parseApiError(result.error);
        Logger.error({ namespace: 'EventNotificator' }, `Failed to send ${notificatorType}`, {
          errorType: formatted.type,
          errorMessage: formatted.message,
          originalError: formatted.originalError,
          requestBody: body,
        });
        toast.error(formatted.message);
        return;
      }

      Logger.info(
        { namespace: 'EventNotificator' },
        `Successfully sent ${notificatorType} notification for event ${eventId}`
      );
      toast.success(
        notificatorType === EventNotificatorType.EMAIL
          ? t('admin.eventNotifier.form.successFeedbackEmail')
          : t('admin.eventNotifier.form.successFeedbackSMS')
      );
      onClose();
    } catch (error) {
      Logger.error(
        { namespace: 'EventNotificator' },
        `Unexpected error in ${notificatorType} handler`,
        { error, eventId, notificatorType, data }
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
          <Input
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
          <Input
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

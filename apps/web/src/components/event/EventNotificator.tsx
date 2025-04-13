import { MarkdownInput } from '@eventuras/markdowninput';
import { EmailNotificationDto, RegistrationType, SmsNotificationDto } from '@eventuras/sdk';
import { CheckboxInput, CheckboxLabel, Form, Input } from '@eventuras/smartform';
import { AppNotificationOptions, Button, ButtonGroup, Heading } from '@eventuras/ui';
import { Logger } from '@eventuras/utils';
import { getTranslations } from 'next-intl/server';
import { useRef } from 'react';
import { SubmitHandler, useForm, UseFormRegister, UseFormReturn } from 'react-hook-form';

import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import { ParticipationTypes } from '@/types';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { participationMap } from '@/utils/api/mappers';
import { mapEnum } from '@/utils/enum';
import Environment from '@/utils/Environment';

type EventEmailerFormValues = {
  subject: string;
  body: string;
  registrationStatus?: Array<string>;
  registrationTypes?: Array<string>;
};

type EventSMSFormValues = Omit<EventEmailerFormValues, 'subject'>;

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

const getBodyDto = (
  eventId: number,
  data: EventEmailerFormValues | EventSMSFormValues
): EmailNotificationDto | SmsNotificationDto => {
  //type juggling... Converts { Status:true, Status2:true, Status3:false} to [Status,Status2]
  const statuses = data.registrationStatus as Object;
  const regStatusList = Object.keys(statuses).filter(
    (key: string) => statuses[key as keyof Object] as any
  );

  const registrationStatuses = regStatusList.reduce(
    (accumulator: string[], currentValue: string) => {
      const key = currentValue as keyof typeof participationMap;
      accumulator = accumulator.concat(participationMap[key]);
      return accumulator;
    },
    []
  );
  //type juggling... Converts { Status:true, Status2:true, Status3:false} to [Status,Status2]
  const tps = data.registrationTypes as Object;
  const registrationTypes = Object.keys(tps).filter(
    (key: string) => tps[key as keyof Object] as any
  );

  if ('subject' in data) {
    return {
      subject: data.subject,
      bodyMarkdown: data.body,
      eventParticipants: {
        eventId: eventId,
        registrationStatuses,
        registrationTypes,
      },
    } as EmailNotificationDto;
  }

  return {
    message: data.body,
    eventParticipants: {
      eventId: eventId,
      registrationStatuses,
      registrationTypes,
    },
  } as SmsNotificationDto;
};

const createFormHandler = (
  eventId: number,
  notificatorType: EventNotificatorType,
  addAppNotification: (options: AppNotificationOptions) => void,
  onClose: () => void
) => {
  const onSubmitForm: SubmitHandler<EventEmailerFormValues | EventSMSFormValues> = async (
    data: EventEmailerFormValues | EventSMSFormValues
  ) => {
    const { t } = createTranslation('admin');
    const { t: common } = createTranslation('common');
    const body = getBodyDto(eventId, data);
    const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
    Logger.info(
      { namespace: 'EventNotificator' },
      `Sending ${notificatorType} notification. RequestBody: ${JSON.stringify(body)}`
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
      Logger.error(
        { namespace: 'EventNotificator' },
        `Failed to send ${notificatorType} notification. Error: ${result.error}`
      );
      addAppNotification({
        message: `${common('errors.fatalError.title')}: ${result.error?.body.errors.BodyMarkdown[0]}`,
        type: AppNotificationType.ERROR,
      });
      throw new Error('Failed to send');
    } else {
      Logger.info(
        { namespace: 'EventNotificator' },
        `Successfully sent ${notificatorType} notification. `
      );
      addAppNotification({
        message:
          notificatorType === EventNotificatorType.EMAIL
            ? t('eventNotifier.form.successFeedbackEmail')
            : t('eventNotifier.form.successFeedbackSMS'),
        type: AppNotificationType.SUCCESS,
        expiresAfter: 0,
      });
      //we are done, lets request a close
      onClose();
    }
  };
  return onSubmitForm;
};

export default function EventNotificator({
  eventTitle,
  eventId,
  onClose,
  notificatorType,
}: EventNotificatorProps) {
  let formHook:
    | UseFormReturn<EventSMSFormValues, any, EventSMSFormValues>
    | UseFormReturn<EventEmailerFormValues, any, EventEmailerFormValues> = useForm();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = formHook;
  const { addAppNotification } = useAppNotifications();
  const { t } = createTranslation('admin');
  const { t: common } = createTranslation('common');

  const emailRegister = register as unknown as UseFormRegister<EventEmailerFormValues>;
  const smsRegister = register as unknown as UseFormRegister<EventSMSFormValues>;
  const defaultSelectedStatus = [ParticipationTypes.active];
  const defaultSelectedType = [RegistrationType.PARTICIPANT];
  const onSubmitForm = useRef(
    createFormHandler(eventId, notificatorType, addAppNotification, onClose)
  ).current;

  const formValues = formHook.getValues();

  return (
    <Form onSubmit={onSubmitForm} className="text-black w-72">
      <div>
        <Heading as="h4">{common('events.event')}</Heading>
        <p>{eventTitle}</p>
      </div>
      <p>{t('eventNotifier.form.status.label')}</p>
      {Object.keys(participationMap).map((status: any) => {
        return (
          <CheckboxInput
            className="relative z-10"
            key={status}
            id={status}
            title={status}
            defaultChecked={defaultSelectedStatus.indexOf(status) > -1}
            {...emailRegister(`registrationStatus.${status}`)}
          >
            <CheckboxLabel>{t(`eventNotifier.form.status.${status}`)}</CheckboxLabel>
          </CheckboxInput>
        );
      })}
      <p>{t('eventNotifier.form.type.label')}</p>

      {mapEnum(RegistrationType, (type: any) => {
        return (
          <CheckboxInput
            className="relative z-10"
            key={type}
            id={type}
            title={type}
            defaultChecked={defaultSelectedType.indexOf(type) > -1}
            {...emailRegister(`registrationTypes.${type}`)}
          >
            <CheckboxLabel>{type}</CheckboxLabel>
          </CheckboxInput>
        );
      })}
      {notificatorType === EventNotificatorType.EMAIL && (
        <div>
          <Input
            name="subject"
            label={t('eventNotifier.form.subject.label')}
            placeholder={t('eventNotifier.form.subject.label')}
          />
        </div>
      )}
      <div>
        {notificatorType === EventNotificatorType.EMAIL && (
          <div id="bodyEditor">
            <MarkdownInput
              name="body"
              label={t('eventNotifier.form.body.label')}
              placeholder={t('eventNotifier.form.body.label')}
            />
          </div>
        )}
        {notificatorType === EventNotificatorType.SMS && (
          <Input
            name="body"
            label={t('eventNotifier.form.body.label')}
            placeholder={t('eventNotifier.form.body.label')}
            multiline
          />
        )}
      </div>

      <ButtonGroup margin="my-4">
        <Button type="submit" variant="primary">
          {common('buttons.send')}
        </Button>
        <Button
          onClick={e => {
            onClose();
            e.preventDefault();
          }}
          variant="secondary"
        >
          {common('buttons.cancel')}
        </Button>
      </ButtonGroup>
    </Form>
  );
}

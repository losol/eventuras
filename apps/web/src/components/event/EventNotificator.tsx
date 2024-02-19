import { EmailNotificationDto, RegistrationStatus, RegistrationType, SmsNotificationDto } from '@eventuras/sdk';
import createTranslation from 'next-translate/createTranslation';
import { SubmitHandler, useForm, UseFormRegister } from 'react-hook-form';

import Button from '@/components/ui/Button';
import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { mapEnum } from '@/utils/enum';
import Environment from '@/utils/Environment';

import DropdownSelect from '../forms/DropdownSelect';
import Form from '../forms/Form';
import { LegacyInputText } from '../forms/Input';
import MarkdownEditView from '../forms/MarkdownEditView';
import TextAreaInput from '../forms/src/inputs/TextAreaInput';
import ButtonGroup from '../ui/ButtonGroup';
import Heading from '../ui/Heading';
import Checkbox, { CheckBoxLabel } from '../forms/Checkbox';

type EventEmailerFormValues = {
  subject: string;
  body: string;
  registrationStatus?: Array<string>;
  registrationTypes?: Array<string>;
};

type EventSMSFormValues = Omit<EventEmailerFormValues, "subject">

export enum EventNotificatorType {
  EMAIL = 'email',
  SMS = 'sms'
}

export type EventNotificatorProps = {
  eventTitle: string;
  eventId: number;
  notificatorType: EventNotificatorType
  onClose: () => void;
};

const getBodyDto = (eventId: number, data: EventEmailerFormValues | EventSMSFormValues): EmailNotificationDto | SmsNotificationDto => {
  //type juggling... Converts { Status:true, Status2:true, Status3:false} to [Status,Status2]
  const rs = data.registrationStatus as Object
  const registrationStatuses = (Object.keys(rs)).filter((key: string) => rs[key as keyof Object] as any)
  //same as above but for registration types instead of status
  const tps = data.registrationTypes as Object
  const registrationTypes = (Object.keys(tps)).filter((key: string) => tps[key as keyof Object] as any)

  if ("subject" in data) {
    return {
      subject: data.subject,
      bodyMarkdown: data.body,
      eventParticipants: {
        eventId: eventId,
        registrationStatuses,
        registrationTypes,
      },
    } as EmailNotificationDto
  }

  return {
    message: data.body,
    eventParticipants: {
      eventId: eventId,
      registrationStatuses,
      registrationTypes
    },
  } as SmsNotificationDto

}

export default function EventNotificator({ eventTitle, eventId, onClose, notificatorType }: EventNotificatorProps) {

  const formHook = notificatorType === EventNotificatorType.EMAIL ? useForm<EventEmailerFormValues>() : useForm<EventSMSFormValues>()
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
  } = formHook;
  const { addAppNotification } = useAppNotifications();
  const { t } = createTranslation('admin');
  const { t: common } = createTranslation('common');

  const emailRegister = register as UseFormRegister<EventEmailerFormValues>
  const smsRegister = register as UseFormRegister<EventSMSFormValues>

  const onSubmitForm: SubmitHandler<EventEmailerFormValues | EventSMSFormValues> = async (
    data: EventEmailerFormValues | EventSMSFormValues
  ) => {

    const body = getBodyDto(eventId, data)
    const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
    const result = notificatorType === EventNotificatorType.EMAIL ? await apiWrapper(() =>
      sdk.notificationsQueueing.postV3NotificationsEmail({
        eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10),
        requestBody: body as EmailNotificationDto,
      })
    ) : await apiWrapper(() =>
      sdk.notificationsQueueing.postV3NotificationsSms({
        eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10),
        requestBody: body as SmsNotificationDto,
      })
    )
    if (!result.ok) {
      addAppNotification({
        id: Date.now(),
        message: common('errors.fatalError.title'),
        type: AppNotificationType.ERROR,
      });
      throw new Error('Failed to send');
    } else {
      addAppNotification({
        id: Date.now(),
        message: t('eventEmailer.form.successFeedback'),
        type: AppNotificationType.SUCCESS,
      });
      //we are done, lets request a close
      onClose();
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmitForm)} className="text-black w-72">
      <div>
        <Heading as="h4">{common('event')}</Heading>
        <p>{eventTitle}</p>
      </div>
      <p>{t('eventEmailer.form.status.label')}</p>
      {
        mapEnum(RegistrationStatus, (status: any) => {
          return <Checkbox
            className="relative z-10"
            key={status}
            id={status}
            title={status}
            {...emailRegister(`registrationStatus.${status}`)}
          >
            <CheckBoxLabel>{status}</CheckBoxLabel>
          </Checkbox>
        })
      }
      <p>{t('eventEmailer.form.type.label')}</p>

      {
        mapEnum(RegistrationType, (type: any) => {
          return <Checkbox
            className="relative z-10"
            key={type}
            id={type}
            title={type}
            {...emailRegister(`registrationTypes.${type}`)}
          >
            <CheckBoxLabel>{type}</CheckBoxLabel>
          </Checkbox>
        })
      }
      {
        (notificatorType === EventNotificatorType.EMAIL) &&
        <div>
          <LegacyInputText
            {...emailRegister('subject', {
              required: t('eventEmailer.form.subject.feedbackNoInput'),
            })}
            label={t('eventEmailer.form.subject.label')}
            placeholder={t('eventEmailer.form.subject.label')}
            errors={errors}
          />
        </div>

      }
      <div>
        {notificatorType === EventNotificatorType.EMAIL && <div id="bodyEditor">
          <MarkdownEditView
            form={formHook}
            formName="body"
            label={t('eventEmailer.form.body.label')}
            placeholder={t('eventEmailer.form.body.label')}
            editmodeOnly={true}
          />
        </div>}
        {notificatorType === EventNotificatorType.SMS &&
          <TextAreaInput
            {...smsRegister('body')}
            name="body"
            label={t('eventEmailer.form.body.label')}
            placeholder={t('eventEmailer.form.body.label')}
          />
        }
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

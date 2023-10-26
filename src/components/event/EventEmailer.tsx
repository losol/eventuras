import { EmailNotificationDto, RegistrationStatus, RegistrationType } from '@losol/eventuras';
import useTranslation from 'next-translate/useTranslation';
import { SubmitHandler, useForm } from 'react-hook-form';

import Button from '@/components/ui/Button';
import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import { sendEmailNotification } from '@/utils/api/functions/notifications';
import { mapEnum } from '@/utils/enum';

import DropdownSelect from '../forms/DropdownSelect';
import { InputText, lightInputStyle } from '../forms/Input';
import MarkdownEditView from '../forms/MarkdownEditView';
import Heading from '../ui/Heading';

type EventEmailerFormValues = {
  subject: string;
  body: string;
  registrationStatus?: Array<string>;
  registrationTypes?: Array<string>;
};

export type EventEmailerProps = {
  eventTitle: string;
  eventId: number;
  recipients?: string[] | null;
  onClose: () => void;
};

export default function EventEmailer({
  eventTitle,
  eventId,
  onClose,
  recipients,
}: EventEmailerProps) {
  const formHook = useForm<EventEmailerFormValues>();
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
  } = formHook;
  const { addAppNotification } = useAppNotifications();
  const { t } = useTranslation('admin');
  const { t: common } = useTranslation('common');
  const hasRecipients = recipients && recipients.length;

  const onSubmitForm: SubmitHandler<EventEmailerFormValues> = async (
    data: EventEmailerFormValues
  ) => {
    const body: EmailNotificationDto = {
      subject: data.subject,
      bodyMarkdown: data.body,
      eventParticipants: {
        eventId,
        registrationStatuses: data.registrationStatus as unknown as RegistrationStatus[],
        registrationTypes: data.registrationTypes as unknown as RegistrationType[],
      },
      recipients,
    };
    const result = await sendEmailNotification(body);
    if (!result.ok) {
      addAppNotification({
        id: Date.now(),
        message: common('errors.fatalError.title'),
        type: AppNotificationType.ERROR,
      });
      throw new Error('Failed to send email');
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
    <form className="text-black w-72" onSubmit={handleSubmit(onSubmitForm)}>
      <div>
        <Heading as="h4">{common('event')}</Heading>
        <p>{eventTitle}</p>
      </div>
      {!hasRecipients && (
        <>
          <DropdownSelect
            className="relative z-10"
            label={t('eventEmailer.form.status.label')}
            control={control}
            rules={{ required: t('eventEmailer.form.status.feedbackNoInput') }}
            name="registrationStatus"
            errors={errors}
            options={mapEnum(RegistrationStatus, (value: any) => ({
              id: value,
              label: value,
            }))}
            multiSelect={true}
          />
          <DropdownSelect
            className="relative z-9"
            label={t('eventEmailer.form.type.label')}
            control={control}
            rules={{ required: t('eventEmailer.form.type.feedbackNoInput') }}
            name="registrationTypes"
            errors={errors}
            options={mapEnum(RegistrationType, (value: any) => ({
              id: value,
              label: value,
            }))}
            multiSelect={true}
          />
        </>
      )}
      <div>
        <InputText
          {...register('subject', {
            required: t('eventEmailer.form.subject.feedbackNoInput'),
          })}
          label={t('eventEmailer.form.subject.label')}
          placeholder={t('eventEmailer.form.subject.label')}
          errors={errors}
          className={`${lightInputStyle}`}
        />
      </div>
      <div>
        <div id="bodyEditor">
          <MarkdownEditView
            form={formHook}
            formName="body"
            label={t('eventEmailer.form.body.label')}
            placeholder={t('eventEmailer.form.body.label')}
            className={`${lightInputStyle}`}
          />
        </div>
      </div>

      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4">
        <Button className={`flex-auto justify-center m-1`} type="submit" variant="secondary">
          {common('buttons.send')}
        </Button>
        <Button
          onClick={e => {
            onClose();
            e.preventDefault();
          }}
          variant="secondary"
          className={`flex-auto justify-center m-1m`}
        >
          {common('buttons.cancel')}
        </Button>
      </div>
    </form>
  );
}

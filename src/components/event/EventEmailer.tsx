import { EmailNotificationDto, RegistrationStatus, RegistrationType } from '@losol/eventuras';
import useTranslation from 'next-translate/useTranslation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import { sendEmailNotification } from '@/utils/api/functions/notifications';
import { mapEnum } from '@/utils/enum';

import Heading from '../content/Heading';
import { Button } from '../inputs';
import { InputText, lightInputStyle } from '../inputs/Input';
import MarkdownEditor from '../inputs/MarkdownEditor';
import MultiSelectDropdown from '../inputs/MultiSelectDropdown';

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
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<EventEmailerFormValues>();
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
          <div className="relative z-10">
            <label htmlFor="statusSelector">{t('eventEmailer.form.status.label')}</label>
            <Controller
              control={control}
              name="registrationStatus"
              rules={{ required: t('eventEmailer.form.status.feedbackNoInput') }}
              render={({ field: { onChange, onBlur, value } }) => {
                return (
                  <MultiSelectDropdown
                    id="statusSelector"
                    options={mapEnum(RegistrationStatus, (value: any) => ({
                      id: value,
                      label: value,
                    }))}
                    onChange={onChange}
                    onBlur={onBlur}
                    selected={value ?? []}
                  />
                );
              }}
            />
            {errors['registrationStatus'] && (
              <label htmlFor="registrationStatus" role="alert" className="text-red-500">
                {errors['registrationStatus']?.message}
              </label>
            )}
          </div>
          <div className="relative z-9">
            <label htmlFor="typeSelector">{t('eventEmailer.form.type.label')}</label>
            <Controller
              control={control}
              name="registrationTypes"
              rules={{ required: t('eventEmailer.form.type.feedbackNoInput') }}
              render={({ field: { onChange, onBlur, value } }) => {
                return (
                  <MultiSelectDropdown
                    id="typeSelector"
                    options={mapEnum(RegistrationType, (value: any) => ({
                      id: value,
                      label: value,
                    }))}
                    onChange={onChange}
                    onBlur={onBlur}
                    selected={value ?? []}
                  />
                );
              }}
            />
            {errors['registrationTypes'] && (
              <label htmlFor="registrationTypes" role="alert" className="text-red-500">
                {errors['registrationTypes']?.message}
              </label>
            )}
          </div>
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
          <MarkdownEditor
            {...register('body', {
              required: t('eventEmailer.form.body.feedbackNoInput'),
            })}
            label={t('eventEmailer.form.body.label')}
            placeholder={t('eventEmailer.form.body.label')}
            className={`${lightInputStyle}`}
            errors={errors}
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

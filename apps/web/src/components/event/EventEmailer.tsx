import { EmailNotificationDto, RegistrationStatus, RegistrationType } from '@eventuras/sdk';
import createTranslation from 'next-translate/createTranslation';
import { SubmitHandler, useForm } from 'react-hook-form';

import Button from '@/components/ui/Button';
import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { mapEnum } from '@/utils/enum';
import Environment from '@/utils/Environment';

import DropdownSelect from '../forms/DropdownSelect';
import { LegacyInputText } from '../forms/Input';
import MarkdownEditView from '../forms/MarkdownEditView';
import ButtonGroup from '../ui/ButtonGroup';
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
  onClose: () => void;
};

export default function EventEmailer({ eventTitle, eventId, onClose }: EventEmailerProps) {
  const formHook = useForm<EventEmailerFormValues>();
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
  } = formHook;
  const { addAppNotification } = useAppNotifications();
  const { t } = createTranslation('admin');
  const { t: common } = createTranslation('common');

  const onSubmitForm: SubmitHandler<EventEmailerFormValues> = async (
    data: EventEmailerFormValues
  ) => {
    const body: EmailNotificationDto = {
      subject: data.subject,
      bodyMarkdown: data.body,
      eventParticipants: {
        eventId: eventId,
        registrationStatuses: data.registrationStatus as unknown as RegistrationStatus[],
        registrationTypes: data.registrationTypes as unknown as RegistrationType[],
      },
    };
    const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
    const result = await apiWrapper(() =>
      sdk.notificationsQueueing.postV3NotificationsEmail({
        eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10),
        requestBody: body,
      })
    );
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
      <div>
        <LegacyInputText
          {...register('subject', {
            required: t('eventEmailer.form.subject.feedbackNoInput'),
          })}
          label={t('eventEmailer.form.subject.label')}
          placeholder={t('eventEmailer.form.subject.label')}
          errors={errors}
        />
      </div>
      <div>
        <div id="bodyEditor">
          <MarkdownEditView
            form={formHook}
            formName="body"
            label={t('eventEmailer.form.body.label')}
            placeholder={t('eventEmailer.form.body.label')}
            editmodeOnly={true}
          />
        </div>
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
    </form>
  );
}

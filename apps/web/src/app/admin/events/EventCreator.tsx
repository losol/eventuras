'use client';
import { ApiError, EventDto, EventInfoStatus, Eventuras } from '@eventuras/sdk';
import { useRouter } from 'next/navigation';
import createTranslation from 'next-translate/createTranslation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { LegacyInputText } from '@/components/forms/Input';
import { Layout } from '@/components/ui';
import Button from '@/components/ui/Button';
import FatalError from '@/components/ui/FatalError';
import Heading from '@/components/ui/Heading';
import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';
import slugify from '@/utils/slugify';

type CreateEventFormValues = {
  title: string;
  slug: string;
  organizationId: number;
};

const publishEvent = (formValues: CreateEventFormValues, sdk: Eventuras) => {
  const org = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10);
  const values = {
    ...formValues,
    status: EventInfoStatus.DRAFT,
  };

  return apiWrapper(() => sdk.events.postV3Events({ eventurasOrgId: org, requestBody: values }));
};

type ApiState = {
  event: EventDto | null;
  error: ApiError | null;
  loading: boolean;
};

const EventCreator = () => {
  const { addAppNotification } = useAppNotifications();
  const { t } = createTranslation();

  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm<CreateEventFormValues>();
  const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const router = useRouter();
  const [apiState, setApiState] = useState<ApiState>({ event: null, error: null, loading: false });

  const onSubmitForm: SubmitHandler<CreateEventFormValues> = async (
    data: CreateEventFormValues
  ) => {
    setApiState({ ...apiState, loading: true });
    const result = await publishEvent(data, sdk);
    if (result.ok) {
      Logger.info({ namespace: 'admin:events' }, `On submit OK`, result.value);
      setApiState({ ...apiState, loading: false, event: result.value });
    } else {
      Logger.info({ namespace: 'admin:events' }, `On submit Error`, result.error);
      setApiState({ ...apiState, loading: false, error: result.error });
    }

    //## Result OK handling
    if (result && result.ok) {
      const nextUrl = `/admin/events/${result.value!.id}/edit`;
      addAppNotification({
        id: Date.now(),
        message: t('admin:createEvent.success'),
        type: AppNotificationType.SUCCESS,
      });
      router.push(nextUrl);
    }
  };

  //## Result Error handling
  if (apiState.error) {
    const status = apiState.error.status;
    const statusText = apiState.error.statusText;
    if (status !== 409) {
      return (
        <FatalError
          title={t('common:errors.fatalError.title')}
          description={t('common:errors.fatalError.description')}
          additional={`${status}: ${statusText}`}
        />
      );
    }
  }

  const errorIfExists = () => {
    if (!apiState.error) return null;
    if (apiState.error.status === 409) {
      return (
        <p role="alert" className="text-red-500">
          {t('admin:createEvent.alreadyExists.title')}
          {t('admin:createEvent.alreadyExists.description')}
        </p>
      );
    }
  };
  const titleRegistration = register('title', {
    required: 'Event title is required',
  });
  const onChangeHook = titleRegistration.onChange;
  titleRegistration.onChange = (eventinfo: { target: any; type?: any }) => {
    setValue('slug', slugify(eventinfo.target.value));
    return onChangeHook(eventinfo);
  };
  //## Render
  return (
    <Layout>
      <Heading>{t('admin:createEvent.content.title')}</Heading>
      <p>{t('Add a fantastic event!')}</p>
      <form onSubmit={handleSubmit(onSubmitForm)} className="px-8 pt-6 pb-8 mb-4">
        <fieldset>
          <input
            type="hidden"
            value={Environment.NEXT_PUBLIC_ORGANIZATION_ID}
            {...register('organizationId')}
          />
          <LegacyInputText
            {...titleRegistration}
            label="Event Title"
            placeholder="Event Title"
            data-test-id="event-title-input"
            errors={errors}
          />
        </fieldset>

        <Button
          loading={apiState.loading}
          type="submit"
          data-test-id="create-event-submit-button"
          onClick={() => {
            // set guid as slug
            setValue('slug', crypto.randomUUID());
          }}
        >
          {t('common:buttons.submit')}
        </Button>
      </form>
      {errorIfExists()}
    </Layout>
  );
};
export default EventCreator;

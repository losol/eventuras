'use client';
import { EventDto, EventInfoStatus } from '@losol/eventuras';
import { useRouter } from 'next/navigation';
import createTranslation from 'next-translate/createTranslation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { defaultInputStyle, InputText } from '@/components/forms/Input';
import { Layout } from '@/components/ui';
import Button from '@/components/ui/Button';
import FatalError from '@/components/ui/FatalError';
import Heading from '@/components/ui/Heading';
import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import ApiError from '@/utils/api/ApiError';
import ApiResult from '@/utils/api/ApiResult';
import { createEvent as postEvent } from '@/utils/api/functions/events';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';
import slugify from '@/utils/slugify';

type CreateEventFormValues = {
  title: string;
  slug: string;
  organizationId: number;
};

const publishEvent = (formValues: CreateEventFormValues) => {
  const values = {
    ...formValues,
    status: EventInfoStatus.DRAFT,
  };

  return postEvent(values);
};

type ApiState = {
  result: ApiResult<EventDto, ApiError> | null;
  loading: boolean;
};

const EventCreator = () => {
  const { addAppNotification } = useAppNotifications();
  const { t } = createTranslation();

  const {
    register,
    getValues,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm<CreateEventFormValues>();

  const router = useRouter();
  const [apiState, setApiState] = useState<ApiState>({ result: null, loading: false });

  const onSubmitForm: SubmitHandler<CreateEventFormValues> = async (
    data: CreateEventFormValues
  ) => {
    setApiState({ result: null, loading: true });
    const result = await publishEvent(data);
    setApiState({ result, loading: false });
    if (result.ok) {
      Logger.info({ namespace: 'admin:events' }, `On submit OK`, result.value);
    } else {
      Logger.info({ namespace: 'admin:events' }, `On submit Error`, result.error);
    }

    //## Result OK handling
    if (result && result.ok) {
      const nextUrl = `/admin/events/${result.value.id}/edit`;
      addAppNotification({
        id: Date.now(),
        message: t('admin:createEvent.success'),
        type: AppNotificationType.SUCCESS,
      });
      router.push(nextUrl);
    }
  };

  //## Result Error handling
  if (apiState.result) {
    const {
      ok,
      error: { statusCode, statusText },
    } = apiState.result;

    if (!ok && statusCode !== 409) {
      return (
        <FatalError
          title={t('common:errors.fatalError.title')}
          description={t('common:errors.fatalError.description')}
          additional={`${statusCode}: ${statusText}`}
        />
      );
    }
  }

  const errorIfExists = () => {
    if (!apiState.result) return null;
    if (apiState.result.error.statusCode === 409) {
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
          <InputText
            {...titleRegistration}
            label="Event Title"
            placeholder="Event Title"
            errors={errors}
            className={defaultInputStyle}
          />
          <InputText
            {...register('slug', {
              required: 'Slug is required',
            })}
            label="Event Slug"
            placeholder="Event Slug"
            errors={errors}
            className={defaultInputStyle}
          />
        </fieldset>

        <Button
          loading={apiState.loading}
          type="submit"
          onClick={() => {
            //slugify slug before submitting
            setValue('slug', slugify(getValues('slug')));
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

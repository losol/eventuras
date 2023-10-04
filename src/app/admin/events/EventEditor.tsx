'use client';
import { EventDto, EventInfoStatus } from '@losol/eventuras';
import { useRouter } from 'next/navigation';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { defaultInputStyle, InputDate, InputText } from '@/components/forms/Input';
import { Layout } from '@/components/ui';
import Button from '@/components/ui/Button';
import FatalError from '@/components/ui/FatalError';
import Heading from '@/components/ui/Heading';
import ApiError from '@/utils/api/ApiError';
import ApiResult from '@/utils/api/ApiResult';
import { createEvent as postEvent, updateEvent } from '@/utils/api/functions/events';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';
import slugify from '@/utils/slugify';

type EventFormValues = {
  title: string;
  slug: string;
  published: boolean;
  organizationId: number;
  dateStart: any;
  dateEnd: any;
};

const publishEvent = (formValues: EventFormValues, eventToUpdate: EventDto | null) => {
  const values = {
    ...formValues,
    status: EventInfoStatus.REGISTRATIONS_OPEN,
  };
  if (eventToUpdate) {
    const updatedValues = {
      ...eventToUpdate,
      ...formValues,
      StartDate: formValues.dateStart, //fix for posting and updating dates
      EndDate: formValues.dateEnd, //fix for posting and updating dates
    };
    return updateEvent(eventToUpdate.id!.toString(), updatedValues);
  }

  return postEvent(values);
};

export type EventEditorProps = {
  eventinfo: EventDto;
};

type ApiState = {
  result: ApiResult<EventDto, ApiError> | null;
  loading: boolean;
};

const EventEditor = ({ eventinfo: eventinfo }: EventEditorProps) => {
  const { t } = useTranslation('admin');
  const { t: common } = useTranslation('common');

  const {
    register,
    getValues,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm<EventFormValues>();

  const router = useRouter();
  const [apiState, setApiState] = useState<ApiState>({ result: null, loading: false });

  useEffect(() => {
    if (eventinfo) {
      setValue('title', eventinfo.title ?? '');
      setValue('slug', eventinfo.slug ?? '');
      setValue('dateStart', eventinfo.dateStart ?? '');
      setValue('dateEnd', eventinfo.dateEnd ?? '');
    }
  }, [eventinfo, setValue]);

  //## Form Handler - POST to create event

  const onSubmitForm: SubmitHandler<EventFormValues> = async (data: EventFormValues) => {
    setApiState({ result: null, loading: true });
    const result = await publishEvent(data, eventinfo);
    setApiState({ result, loading: false });
    if (result.ok) {
      Logger.info({ namespace: 'admin:events' }, `On submit OK`, result.value);
    } else {
      Logger.info({ namespace: 'admin:events' }, `On submit Error`, result.error);
    }

    //## Result OK handling
    if (result && result.ok) {
      let nextUrl = '/admin';
      if (!eventinfo) {
        nextUrl = `/admin/events/${result.value.id}`;
      }
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
          title={common('errors.fatalError.title')}
          description={common('errors.fatalError.description')}
          additional={`${statusCode}: ${statusText}`}
        />
      );
    }
  }

  //## Render
  return (
    <Layout>
      <Heading>{t(`editEvent.content.title`)}</Heading>
      <p>{t(`editEvent.content.description`)}</p>
      <form onSubmit={handleSubmit(onSubmitForm)} className="shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <fieldset disabled={apiState.loading}>
          <input
            type="hidden"
            value={Environment.NEXT_PUBLIC_ORGANIZATION_ID}
            {...register('organizationId')}
          />
          <InputText
            {...register('title', {
              required: 'Event title is required',
            })}
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
          {eventinfo && (
            <>
              <InputDate label="Start date" {...register('dateStart')} />
              <InputDate label="End date" {...register('dateEnd')} />
            </>
          )}
        </fieldset>

        <Button
          loading={apiState.loading}
          type="submit"
          onClick={() => {
            //slugify slug before submitting
            setValue('slug', slugify(getValues('slug')));
          }}
        >
          {common('buttons.submit')}
        </Button>
      </form>
    </Layout>
  );
};
export default EventEditor;

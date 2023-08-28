'use client';
import { EventDto } from '@losol/eventuras';
import { useRouter } from 'next/navigation';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { Heading } from '@/components/content';
import { Button } from '@/components/inputs';
import { InputText } from '@/components/inputs/Input';
import { Layout } from '@/components/layout';
import ApiError from '@/utils/api/ApiError';
import ApiResult from '@/utils/api/ApiResult';
import { createEvent as postEvent } from '@/utils/api/functions/events';
import Logger from '@/utils/Logger';

type CreateEventFormValues = {
  title: string;
  slug: string;
  organizationId: number;
};

const CreateEvent = () => {
  const { t } = useTranslation('admin');
  const { t: common } = useTranslation('common');
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<CreateEventFormValues>();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ApiResult<EventDto, ApiError> | null>(null);

  const onSubmitForm: SubmitHandler<CreateEventFormValues> = async (
    data: CreateEventFormValues
  ) => {
    setResult(null);
    setLoading(true);
    const result = await postEvent(data);
    setResult(result);
    setLoading(false);
    if (result.ok) {
      Logger.info({ namespace: 'admin:events' }, `Event created`, result.value);
    } else {
      Logger.info({ namespace: 'admin:events' }, `Event not created`, result.error);
    }
  };
  if (result?.ok) {
    router.push(`/admin/events/${result.value.id}/edit`);
  }
  return (
    <Layout>
      <Heading>{t('createEvent.title')}</Heading>
      <p>{t('createEvent.description')}</p>
      <form onSubmit={handleSubmit(onSubmitForm)} className="shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <input
          type="hidden"
          value={process.env.NEXT_PUBLIC_ORGANIZATION_ID ?? 1}
          {...register('organizationId')}
        />
        <InputText
          {...register('title', {
            required: 'Event title is required',
          })}
          placeholder="Event Title"
          errors={errors}
        />
        <InputText
          {...register('slug', {
            required: 'Slug is required',
          })}
          placeholder="Event UrlSlug"
          errors={errors}
        />

        <Button loading={loading} type="submit">
          {common('buttons.submit')}
        </Button>
      </form>
      {result?.error?.statusCode === 409 && (
        <p role="alert" className="text-red-500">
          An event with that slug already exists!
        </p>
      )}
    </Layout>
  );
};
export default CreateEvent;

'use client';
import { EventDto, EventInfoStatus, EventInfoType } from '@losol/eventuras';
import { useRouter } from 'next/navigation';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import Checkbox, { CheckBoxLabel } from '@/components/forms/Checkbox';
import DropdownSelect from '@/components/forms/DropdownSelect';
import { defaultInputStyle, InputDate, InputText, lightInputStyle } from '@/components/forms/Input';
import MarkdownEditor from '@/components/forms/MarkdownEditor';
import { Layout } from '@/components/ui';
import Button from '@/components/ui/Button';
import FatalError from '@/components/ui/FatalError';
import Heading from '@/components/ui/Heading';
import ApiError from '@/utils/api/ApiError';
import ApiResult from '@/utils/api/ApiResult';
import { createEvent as postEvent, updateEvent } from '@/utils/api/functions/events';
import { mapEnum } from '@/utils/enum';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';
import slugify from '@/utils/slugify';

/** TODO - figure out how to convert EventDto to this type and make all fields non nullable */
type EventFormValues = {
  title: string;
  slug: string;
  category: string;
  description: string;
  city: string;
  headline: string;
  location: string;
  featuredImageUrl: string;
  featuredImageCaption: string;
  program: string;
  published: boolean;
  organizationId: number;
  dateStart: any;
  dateEnd: any;
  lastRegistrationDate: any;
  type: EventInfoType;
  status: EventInfoStatus;
  featured: boolean;
  onDemand: boolean;
  practicalInformation: string;
  moreInformation: string;
  welcomeLetter: string;
  informationRequest: string;
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
    control,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm<EventFormValues>();

  const router = useRouter();
  const [apiState, setApiState] = useState<ApiState>({ result: null, loading: false });

  const fieldsetClassName = 'text-lg pt-3 pb-6';
  const fieldsetLegendClassName = 'text-lg border-b-2 pt-4 pb-2';

  const defaults: Map<string, string | boolean> = new Map();
  defaults.set('type', EventInfoType.CONFERENCE);
  defaults.set('status', EventInfoStatus.REGISTRATIONS_CLOSED);
  defaults.set('featured', false);
  defaults.set('onDemand', false);
  defaults.set('published', false);

  useEffect(() => {
    if (eventinfo) {
      const keys = Object.keys(eventinfo) as Array<keyof typeof eventinfo | string>;
      keys.forEach((key: any) => {
        const acc = key as keyof typeof eventinfo;
        let val = eventinfo[acc];
        if (val === undefined || val === null) {
          val = defaults.get(key);
        }
        const k = key.toString();
        setValue(k, val);
      });
    }
  }, [eventinfo.id, setValue]);

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
        <fieldset disabled={apiState.loading} className={fieldsetClassName}>
          <legend className={fieldsetLegendClassName}>Overview</legend>
          <input
            type="hidden"
            value={Environment.NEXT_PUBLIC_ORGANIZATION_ID}
            {...register('organizationId')}
          />

          <InputText
            {...register('title', {
              required: 'Event title is required',
            })}
            label="Title"
            placeholder="Event Title"
            errors={errors}
            className={`${defaultInputStyle}  mb-4`}
          />
          <InputText
            {...register('headline')}
            label="Headline"
            placeholder="Event Headline"
            errors={errors}
            className={`${defaultInputStyle}  mb-4`}
          />
          <InputText
            {...register('category')}
            label="Category"
            placeholder="Event Category"
            errors={errors}
            className={`${defaultInputStyle}  mb-4`}
          />
          <DropdownSelect
            multiSelect={false}
            className="relative z-11 mb-4"
            label="Event Type"
            control={control}
            rules={{ required: 'An Event Type is required' }}
            name="type"
            errors={errors}
            options={mapEnum(EventInfoType, (value: any) => ({
              id: value,
              label: value,
            }))}
          />
          <DropdownSelect
            multiSelect={false}
            className="relative z-10 mb-4"
            label="Status"
            control={control}
            rules={{ required: 'Status is required' }}
            name="status"
            errors={errors}
            options={mapEnum(EventInfoStatus, (value: any) => ({
              id: value,
              label: value,
            }))}
          />
          <MarkdownEditor
            {...register('description', {
              required: 'Please provide a description of the event',
            })}
            label="Description"
            placeholder="An Event Description here (markdown supported)"
            className={`${lightInputStyle}`}
            errors={errors}
          />
          <InputText
            {...register('slug', {
              required: 'Slug is required',
            })}
            label="Slug"
            placeholder="Event Slug"
            errors={errors}
            className={`${defaultInputStyle}  mb-4`}
          />
          {eventinfo && (
            <div className="mb-4">
              <p>Event Dates</p>
              <div className="flex direction-row">
                <InputDate
                  label="Start:"
                  {...register('dateStart')}
                  className="text-white bg-slate-700 p-2 m-2"
                />
                <InputDate
                  label="End:"
                  {...register('dateEnd')}
                  className="text-white bg-slate-700 p-2 m-2"
                />
              </div>
              <InputDate
                label="Last Registration Date"
                {...register('lastRegistrationDate')}
                className="text-white bg-slate-700 p-2 m-2"
              />
            </div>
          )}
        </fieldset>
        <fieldset disabled={apiState.loading} className={fieldsetClassName}>
          <legend className={fieldsetLegendClassName}>Location</legend>
          <InputText
            {...register('city')}
            label="City"
            placeholder="City"
            errors={errors}
            className={`${defaultInputStyle}  mb-4`}
          />
          <InputText
            {...register('location')}
            label="Location"
            placeholder="Location"
            errors={errors}
            className={`${defaultInputStyle}  mb-4`}
          />
        </fieldset>
        <fieldset></fieldset>
        <fieldset disabled={apiState.loading} className={fieldsetClassName}>
          <legend className={fieldsetLegendClassName}>Image</legend>
          <InputText
            {...register('featuredImageUrl', {
              pattern: {
                value:
                  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i,
                message: 'Invalid url',
              },
            })}
            label="Image Url"
            placeholder="Image Url"
            errors={errors}
            className={`${defaultInputStyle}  mb-4`}
          />
          <InputText
            {...register('featuredImageCaption')}
            label="Image Caption"
            placeholder="Image Caption"
            errors={errors}
            className={`${defaultInputStyle}  mb-4`}
          />
        </fieldset>
        <fieldset>
          <legend className={fieldsetLegendClassName}>Additional Information</legend>
          <MarkdownEditor
            {...register('program')}
            label="Program"
            placeholder="An Event Program here (markdown supported)"
            className={`${lightInputStyle}`}
            errors={errors}
          />
          <MarkdownEditor
            {...register('practicalInformation')}
            label="Practical Information"
            placeholder="Practical Information here (markdown supported)"
            className={`${lightInputStyle}`}
            errors={errors}
          />
          <MarkdownEditor
            {...register('moreInformation')}
            label="More Information"
            placeholder="More Information here (markdown supported)"
            className={`${lightInputStyle}`}
            errors={errors}
          />
          <MarkdownEditor
            {...register('welcomeLetter')}
            label="Welcome Letter"
            placeholder="Welcome letter here (markdown supported)"
            className={`${lightInputStyle}`}
            errors={errors}
          />
          <MarkdownEditor
            {...register('informationRequest')}
            label="Information Request"
            placeholder="Information Request (markdown supported)"
            className={`${lightInputStyle}`}
            errors={errors}
          />
        </fieldset>
        <fieldset disabled={apiState.loading} className={fieldsetClassName}>
          <legend className={fieldsetLegendClassName}>Settings</legend>
          <div className="flex flex-row">
            <div className="mr-4">
              <Checkbox id="event-featured" {...register('featured')}>
                <CheckBoxLabel>Featured</CheckBoxLabel>
              </Checkbox>
            </div>
            <div className="mr-4">
              <Checkbox id="event-onDemand" {...register('onDemand')}>
                <CheckBoxLabel>On Demand</CheckBoxLabel>
              </Checkbox>
            </div>
            <div className="mr-4">
              <Checkbox id="event-published" {...register('published')}>
                <CheckBoxLabel>Published</CheckBoxLabel>
              </Checkbox>
            </div>
          </div>
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

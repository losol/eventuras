'use client';
import Form from '@eventuras/forms/Form';
import Fieldset from '@eventuras/forms/src/Fieldset';
import CheckboxInput, { CheckBoxLabel } from '@eventuras/forms/src/inputs/CheckboxInput';
import { DateInput } from '@eventuras/forms/src/inputs/DateInput';
import HiddenInput from '@eventuras/forms/src/inputs/HiddenInput';
import MarkdownInput from '@eventuras/forms/src/inputs/MarkdownInput';
import NumberInput from '@eventuras/forms/src/inputs/NumberInput';
import Select from '@eventuras/forms/src/inputs/Select';
import TextInput from '@eventuras/forms/src/inputs/TextInput';
import { ApiError, EventDto, EventFormDto, EventInfoStatus, EventInfoType } from '@eventuras/sdk';
import Button from '@eventuras/ui/Button';
import Tabs from '@eventuras/ui/Tabs';
import { useRouter } from 'next/navigation';
import createTranslation from 'next-translate/createTranslation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { mapEnum } from '@/utils/enum';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';
import slugify from '@/utils/slugify';

export type EventEditorProps = {
  eventinfo: EventDto;
};

type ApiState = {
  error: ApiError | null;
  loading: boolean;
};

const EventEditor = ({ eventinfo: eventinfo }: EventEditorProps) => {
  const { t } = createTranslation();
  const [apiState, setApiState] = useState<ApiState>({ error: null, loading: false });
  const eventuras = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const { register } = useForm<EventFormDto>();
  const { addAppNotification } = useAppNotifications();
  const router = useRouter();

  // Form submit handler
  const onSubmitForm: SubmitHandler<EventFormDto> = async (data: EventFormDto) => {
    setApiState({ error: null, loading: true });
    Logger.info({ namespace: 'EventEditor' }, 'Updating event...');
    Logger.info({ namespace: 'EventEditor' }, data);

    // set slug
    const newSlug = slugify(
      [data.title, data.city, data.dateStart?.year, data.id].filter(Boolean).join('-')
    );
    data.slug = newSlug;

    // Remember to set loading state
    setApiState({ error: null, loading: true });

    const result = await apiWrapper(() =>
      eventuras.events.putV3Events({
        id: eventinfo.id!,
        requestBody: data,
      })
    );

    if (result.ok) {
      addAppNotification({
        id: Date.now(),
        message: 'Event information was updated!',
        type: AppNotificationType.SUCCESS,
      });
    } else {
      addAppNotification({
        id: Date.now(),
        message: `Something bad happended: ${result.error}!`,
        type: AppNotificationType.ERROR,
      });
    }
    Logger.info({ namespace: 'eventeditor' }, result);

    setApiState({ error: null, loading: false });

    router.push(`/admin/events/${eventinfo.id}`);
  };

  return (
    <Form defaultValues={eventinfo} onSubmit={onSubmitForm} data-test-id="event-edit-form">
      <HiddenInput name="organizationId" value={Environment.NEXT_PUBLIC_ORGANIZATION_ID} />
      <Tabs>
        <Tabs.Item title="Overview">
          <Fieldset label="Settings" disabled={apiState.loading}>
            <div className="flex flex-row">
              <div className="mr-4">
                <CheckboxInput name="featured">
                  <CheckBoxLabel>Featured</CheckBoxLabel>
                </CheckboxInput>
              </div>
            </div>
          </Fieldset>
          <Fieldset label="Headings" disabled={apiState.loading}>
            <input
              name="organizationId"
              type="hidden"
              value={Environment.NEXT_PUBLIC_ORGANIZATION_ID}
            />

            <TextInput name="title" required label="Title" placeholder="Event Title" />
            <TextInput name="headline" label="Headline" placeholder="Event Headline" />
            <TextInput name="category" label="Category" placeholder="Event Category" />
            <Select
              name="type"
              label="Type"
              options={mapEnum(EventInfoType, (value: any) => ({
                value: value,
                label: value,
              }))}
            />
            <Select
              name="status"
              label="Status"
              options={mapEnum(EventInfoStatus, (value: any) => ({
                value: value,
                label: value,
              }))}
              dataTestId="event-status-select-button"
            />
            <NumberInput
              name="maxParticipants"
              label="Max Participants"
              placeholder="Max Participants"
            />
          </Fieldset>
          <Fieldset label="Image" disabled={apiState.loading}>
            <TextInput
              name="featuredImageUrl"
              label="Image Url"
              placeholder="Image Url"
              validation={{
                pattern: {
                  value:
                    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i,
                  message: 'Invalid url',
                },
              }}
            />
            <TextInput
              name="featuredImageCaption"
              label="Image Caption"
              placeholder="Image Caption"
            />
          </Fieldset>
        </Tabs.Item>
        <Tabs.Item title="Dates and location">
          <Fieldset label="Date and time">
            <DateInput label="Start date:" name="dateStart" />
            <DateInput label="End date:" name="dateEnd" />
            <DateInput label="Last Registration Date" name="lastRegistrationDate" />
            <DateInput label="Last Cancellation Date" name="lastCancellationDate" />
          </Fieldset>
          <Fieldset label="Location" disabled={apiState.loading}>
            <TextInput name="city" label="City" placeholder="City" />
            <TextInput name="location" label="Location" placeholder="Location" />
          </Fieldset>
        </Tabs.Item>
        <Tabs.Item title="Descriptions">
          <Fieldset label="Additional information">
            <MarkdownInput
              name="description"
              label="Description (max 300 characters)"
              placeholder="An Event Description here (markdown supported)"
              maxLength={300}
            />
            <MarkdownInput
              name="program"
              label="Program"
              placeholder="An Event Program here (markdown supported)"
            />
            <MarkdownInput
              name="practicalInformation"
              label="Practical Information"
              placeholder="Practical Information here (markdown supported)"
            />
            <MarkdownInput
              name="moreInformation"
              label="More Information"
              placeholder="More Information here (markdown supported)"
            />
            <MarkdownInput
              name="welcomeLetter"
              label="Welcome Letter"
              placeholder="Welcome letter here (markdown supported)"
            />
            <MarkdownInput
              name="informationRequest"
              label="Information Request"
              placeholder="Information Request (markdown supported)"
            />
          </Fieldset>
        </Tabs.Item>
        <Tabs.Item title="Certificate">
          <Fieldset label="Certificate info">
            <TextInput
              name="certificateTitle"
              label="Certificate Title"
              placeholder="Certificate Title"
            />
            <TextInput
              {...register('certificateDescription')}
              label="Certificate Description"
              placeholder="Certificate Description"
            />
          </Fieldset>
        </Tabs.Item>
        <Tabs.Item title="Advanced">
          <Fieldset label="Additional Fields" disabled={apiState.loading}>
            <NumberInput
              name="id"
              label="Id"
              placeholder="Event Id"
              disabled
              dataTestId="eventeditor-form-eventid"
            />
            <TextInput name="slug" label="Slug" placeholder="Event Slug" disabled />
            <TextInput
              name="externalInfoPageUrl"
              label="External Info Page URL"
              placeholder="External Info Page URL"
            />
            <TextInput
              name="externalRegistrationsUrl"
              label="External Registrations URL"
              placeholder="External Registrations URL"
            />
          </Fieldset>
        </Tabs.Item>
      </Tabs>

      <Button loading={apiState.loading} type="submit">
        {t('common:buttons.submit')}
      </Button>
    </Form>
  );
};
export default EventEditor;

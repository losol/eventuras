'use client';
import { ApiError, EventDto, EventFormDto, EventInfoStatus, EventInfoType } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import Form from '@/components/forms/Form';
import Fieldset from '@/components/forms/src/Fieldset';
import CheckboxInput, { CheckBoxLabel } from '@/components/forms/src/inputs/CheckboxInput';
import { DateInput } from '@/components/forms/src/inputs/DateInput';
import HiddenInput from '@/components/forms/src/inputs/HiddenInput';
import MarkdownInput from '@/components/forms/src/inputs/MarkdownInput';
import Select from '@/components/forms/src/inputs/Select';
import TextInput from '@/components/forms/src/inputs/TextInput';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
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

  // Form submit handler
  const onSubmitForm: SubmitHandler<EventFormDto> = async (data: EventFormDto) => {
    Logger.info({ namespace: 'EventEditor' }, data);

    // Remember to set loading state
    setApiState({ error: null, loading: true });

    const result = await apiWrapper(() =>
      eventuras.events.putV3Events({
        id: eventinfo.id!,
        requestBody: data,
      })
    );

    Logger.info({ namespace: 'eventeditor' }, result);

    const newSlug = slugify(data.slug);
    Logger.info({ namespace: 'eventeditor' }, `Slugified to ${newSlug}`);

    // set slug
    // something like slugify(getValues('slug')));
    setApiState({ error: null, loading: false });
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
              <div className="mr-4">
                <CheckboxInput name="onDemand">
                  <CheckBoxLabel>On Demand</CheckBoxLabel>
                </CheckboxInput>
              </div>
              <div className="mr-4">
                <CheckboxInput name="published" data-test-id="event-published-checkbox">
                  <CheckBoxLabel>Published</CheckBoxLabel>
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
            />
            <TextInput
              {...register('maxParticipants')}
              label="Max Participants"
              type="number"
              placeholder="Max Participants"
              defaultValue={0}
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
              placeholder="An Event Description here (markdown supported)"
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
            <TextInput name="slug" label="Slug" placeholder="Event Slug" />
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

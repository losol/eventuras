'use client';

import { Fieldset } from '@eventuras/ratio-ui/forms';
import { MarkdownInput } from '@eventuras/markdowninput';
import { ApiError, EventDto, EventFormDto, EventInfoStatus, EventInfoType } from '@eventuras/sdk';
import {
  CheckboxInput,
  CheckboxLabel,
  Form,
  HiddenInput,
  Input,
  NumberInput,
  Select,
} from '@eventuras/smartform';
import { Button } from '@eventuras/ratio-ui';
import { DATA_TEST_ID, Logger } from '@eventuras/utils';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';

import { Tabs } from '@eventuras/ratio-ui/core/Tabs';
import { useToast } from '@eventuras/toast/src/useToast';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { mapEnum } from '@/utils/enum';
import Environment from '@/utils/Environment';
import slugify from '@/utils/slugify';

export type EventEditorProps = {
  eventinfo: EventDto;
};

type ApiState = {
  error: ApiError | null;
  loading: boolean;
};

const EventEditor = ({ eventinfo: eventinfo }: EventEditorProps) => {
  const t = useTranslations();
  const [apiState, setApiState] = useState<ApiState>({ error: null, loading: false });
  const eventuras = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const toast = useToast();
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
      toast.success('Event information was updated!');
    } else {
      toast.error(`Something bad happended: ${result.error}!`);
    }
    Logger.info({ namespace: 'eventeditor' }, result);

    setApiState({ error: null, loading: false });

    router.push(`/admin/events/${eventinfo.id}`);
  };

  return (
    <Form
      defaultValues={eventinfo}
      onSubmit={onSubmitForm}
      {...{ [DATA_TEST_ID]: 'event-edit-form' }}
      shouldUnregister={false}
    >
      <HiddenInput name="organizationId" value={Environment.NEXT_PUBLIC_ORGANIZATION_ID} />
      <Tabs>
        <Tabs.Item title="Overview">
          <Fieldset label="Settings" disabled={apiState.loading}>
            <div className="flex flex-row">
              <div className="mr-4">
                <CheckboxInput name="featured">
                  <CheckboxLabel>Featured</CheckboxLabel>
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

            <Input name="title" required label="Title" placeholder="Event Title" />
            <Input name="headline" label="Headline" placeholder="Event Headline" />
            <Input name="category" label="Category" placeholder="Event Category" />
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
              {...{ [DATA_TEST_ID]: 'event-status-select-button' }}
            />
            <NumberInput
              name="maxParticipants"
              label="Max Participants"
              placeholder="Max Participants"
            />
          </Fieldset>
          <Fieldset label="Image" disabled={apiState.loading}>
            <Input
              name="featuredImageUrl"
              label="Image Url"
              placeholder="Image Url"
              validation={{
                pattern: {
                  value:
                    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_.~#?&//=]*)/i,
                  message: 'Invalid url',
                },
              }}
            />
            <Input name="featuredImageCaption" label="Image Caption" placeholder="Image Caption" />
          </Fieldset>
        </Tabs.Item>
        <Tabs.Item title="Dates and location">
          <Fieldset label="Date and time">
            <Input label="Start date:" name="dateStart" type="date" />
            <Input label="End date:" name="dateEnd" type="date" />
            <Input label="Last Registration Date" name="lastRegistrationDate" type="date" />
            <Input label="Last Cancellation Date" name="lastCancellationDate" type="date" />
          </Fieldset>
          <Fieldset label="Location" disabled={apiState.loading}>
            <Input name="city" label="City" placeholder="City" />
            <Input name="location" label="Location" placeholder="Location" />
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
            <Input
              name="certificateTitle"
              label="Certificate Title"
              placeholder="Certificate Title"
            />
            <Input
              name="certificateDescription"
              label="Certificate Description"
              placeholder="Certificate Description"
              multiline
              rows={5}
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
              {...{ [DATA_TEST_ID]: 'eventeditor-form-eventid' }}
            />
            <Input name="slug" label="Slug" placeholder="Event Slug" disabled />
            <Input
              name="externalInfoPageUrl"
              label="External Info Page URL"
              placeholder="External Info Page URL"
            />
            <Input
              name="externalRegistrationsUrl"
              label="External Registrations URL"
              placeholder="External Registrations URL"
            />
          </Fieldset>
        </Tabs.Item>
      </Tabs>

      <Button loading={apiState.loading} type="submit">
        {t('common.buttons.submit')}
      </Button>
    </Form>
  );
};
export default EventEditor;

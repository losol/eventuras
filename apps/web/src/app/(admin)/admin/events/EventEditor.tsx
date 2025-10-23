'use client';
import { useEffect, useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { MarkdownInput } from '@eventuras/markdowninput';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Tabs } from '@eventuras/ratio-ui/core/Tabs';
import { Fieldset } from '@eventuras/ratio-ui/forms';
import {
  CheckboxInput,
  CheckboxLabel,
  Form,
  HiddenInput,
  Input,
  NumberInput,
  Select,
} from '@eventuras/smartform';
import { useToast } from '@eventuras/toast';

import { publicEnv } from '@/config.client';
import { EventDto, EventFormDto } from '@/lib/eventuras-sdk';
import slugify from '@/utils/slugify';

import { updateEvent } from './actions';

import '@eventuras/scribo/style.css';
export type EventEditorProps = {
  eventinfo: EventDto;
};
type ApiState = {
  error: string | null;
  loading: boolean;
};
const EventEditor = ({ eventinfo: eventinfo }: EventEditorProps) => {
  console.log('EventEditor rendering with eventinfo:', eventinfo);
  const t = useTranslations();
  const [apiState, setApiState] = useState<ApiState>({ error: null, loading: false });
  const toast = useToast();
  const router = useRouter();
  const logger = Logger.create({
    namespace: 'web:admin:events',
    context: { component: 'EventEditor', eventId: eventinfo.id },
  });
  // Log the event data when component mounts
  useEffect(() => {
    logger.debug(
      {
        eventId: eventinfo.id,
        eventTitle: eventinfo.title,
        eventSlug: eventinfo.slug,
        eventStatus: eventinfo.status,
        eventType: eventinfo.type,
        eventCity: eventinfo.city,
        hasDateStart: !!eventinfo.dateStart,
        hasDateEnd: !!eventinfo.dateEnd,
        featured: eventinfo.featured,
        published: eventinfo.published,
      },
      'EventEditor loaded with event data'
    );
  }, [eventinfo, logger]);
  // Form submit handler
  const onSubmitForm: SubmitHandler<EventFormDto> = async (data: EventFormDto) => {
    setApiState({ error: null, loading: true });
    logger.info('Updating event...');
    logger.debug(
      {
        eventId: eventinfo.id,
        formTitle: data.title,
        formSlug: data.slug,
        formOrgId: data.organizationId,
        formStatus: data.status,
        formType: data.type,
        formCity: data.city,
      },
      'Event form data before processing'
    );
    // Use the organization ID from config
    // Events belong to this organization and we're just maintaining that relationship
    const orgId = publicEnv.NEXT_PUBLIC_ORGANIZATION_ID;
    if (!orgId || isNaN(orgId)) {
      logger.error(
        { orgId, typeOfOrgId: typeof orgId },
        'Organization ID is not configured or invalid'
      );
      toast.error('Configuration error: Organization ID is missing or invalid');
      setApiState({ error: 'Organization ID is not configured', loading: false });
      return;
    }
    data.organizationId = orgId;
    logger.debug(
      { organizationId: data.organizationId },
      'Using configured organizationId for update'
    );
    // set slug
    const year = data.dateStart ? new Date(data.dateStart).getFullYear() : undefined;
    const newSlug = slugify([data.title, data.city, year, data.id].filter(Boolean).join('-'));
    data.slug = newSlug;
    const result = await updateEvent(eventinfo.id!, data);
    if (result.success) {
      logger.info('Event information updated successfully');
      toast.success('Event information was updated!');
      setApiState({ error: null, loading: false });
      router.push(`/admin/events/${eventinfo.id}`);
    } else {
      logger.error(
        {
          eventId: eventinfo.id,
          errorCode: result.error.code,
          errorMessage: result.error.message,
          errorDetails: result.error.details,
        },
        'Failed to update event'
      );
      // Provide user-friendly error message with more context
      const userMessage = result.error.message;
      const errorCode = result.error.code ? ` (${result.error.code})` : '';
      toast.error(`Could not update event: ${userMessage}${errorCode}`);
      setApiState({ error: result.error.message, loading: false });
    }
  };
  return (
    <Form
      defaultValues={eventinfo}
      onSubmit={onSubmitForm}
      testId="event-edit-form"
      shouldUnregister={false}
    >
      <HiddenInput
        name="organizationId"
        value={publicEnv.NEXT_PUBLIC_ORGANIZATION_ID?.toString() ?? ''}
      />
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
              value={publicEnv.NEXT_PUBLIC_ORGANIZATION_ID?.toString() ?? ''}
            />
            <Input name="title" required label="Title" placeholder="Event Title" />
            <Input name="headline" label="Headline" placeholder="Event Headline" />
            <Input name="category" label="Category" placeholder="Event Category" />
            <Select
              name="type"
              label="Type"
              options={[
                { value: 'Course', label: 'Course' },
                { value: 'Conference', label: 'Conference' },
                { value: 'OnlineCourse', label: 'OnlineCourse' },
                { value: 'Social', label: 'Social' },
                { value: 'Other', label: 'Other' },
              ]}
            />
            <Select
              name="status"
              label="Status"
              options={[
                { value: 'Draft', label: 'Draft' },
                { value: 'Planned', label: 'Planned' },
                { value: 'RegistrationsOpen', label: 'RegistrationsOpen' },
                { value: 'WaitingList', label: 'WaitingList' },
                { value: 'RegistrationsClosed', label: 'RegistrationsClosed' },
                { value: 'Finished', label: 'Finished' },
                { value: 'Archived', label: 'Archived' },
                { value: 'Cancelled', label: 'Cancelled' },
              ]}
              testId="event-status-select-button"
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
              testId="eventeditor-form-eventid"
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

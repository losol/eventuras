'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useFormContext } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Tabs } from '@eventuras/ratio-ui/core/Tabs';
import { Fieldset } from '@eventuras/ratio-ui/forms';
import { Check, LoaderCircle, X } from '@eventuras/ratio-ui/icons';
import { MarkdownInput } from '@eventuras/scribo';
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

// Wrapper component to use react-hook-form Controller with MarkdownInput
const ControlledMarkdownInput = ({ name, ...props }: any) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <MarkdownInput
          {...props}
          name={name}
          defaultValue={field.value}
          onChange={field.onChange}
        />
      )}
    />
  );
};
export type EventEditorProps = {
  eventinfo: EventDto;
};
type ApiState = {
  error: string | null;
  loading: boolean;
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Auto-save wrapper component that watches form changes
const AutoSaveHandler = ({
  autoSaveEnabled,
  onAutoSave,
}: {
  autoSaveEnabled: boolean;
  onAutoSave: (data: EventFormDto) => void;
}) => {
  const { watch, getValues } = useFormContext<EventFormDto>();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousValuesRef = useRef<EventFormDto | null>(null);

  useEffect(() => {
    console.log('AutoSaveHandler effect running, autoSaveEnabled:', autoSaveEnabled);
    if (!autoSaveEnabled) return;

    const subscription = watch((value, { name, type }) => {
      console.log('Form field changed:', { name, type, autoSaveEnabled });

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for debounced save
      saveTimeoutRef.current = setTimeout(() => {
        const currentValues = getValues();
        console.log('Checking if should save:', {
          currentValues,
          previousValues: previousValuesRef.current,
          changed: JSON.stringify(currentValues) !== JSON.stringify(previousValuesRef.current),
        });

        // Only save if values have actually changed
        if (JSON.stringify(currentValues) !== JSON.stringify(previousValuesRef.current)) {
          console.log('Triggering auto-save...');
          previousValuesRef.current = currentValues;
          onAutoSave(currentValues);
        }
      }, 1000); // 1 second debounce
    });

    return () => {
      subscription.unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [autoSaveEnabled, watch, getValues, onAutoSave]);

  return null;
};

const EventEditor = ({ eventinfo }: EventEditorProps) => {
  const t = useTranslations();
  const [apiState, setApiState] = useState<ApiState>({ error: null, loading: false });
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true); // Default to true
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const toast = useToast();
  const router = useRouter();
  const logger = Logger.create({
    namespace: 'web:admin:events',
    context: { component: 'EventEditor', eventId: eventinfo.id },
  });

  // Auto-save handler
  const handleAutoSave = useCallback(
    async (data: EventFormDto) => {
      setSaveStatus('saving');
      logger.info({ autoSave: true }, 'Auto-saving event...');

      const orgId = publicEnv.NEXT_PUBLIC_ORGANIZATION_ID;
      if (!orgId || Number.isNaN(orgId)) {
        logger.error({ orgId }, 'Organization ID is not configured for auto-save');
        setSaveStatus('error');
        return;
      }

      data.organizationId = orgId;

      // Set slug
      const year = data.dateStart ? new Date(data.dateStart).getFullYear() : undefined;
      const newSlug = slugify([data.title, data.city, year, data.id].filter(Boolean).join('-'));
      data.slug = newSlug;

      const result = await updateEvent(eventinfo.id!, data);

      if (result.success) {
        logger.info({ autoSave: true }, 'Auto-save successful');
        setSaveStatus('saved');
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        logger.error(
          {
            autoSave: true,
            error: result.error,
          },
          'Auto-save failed'
        );
        setSaveStatus('error');
        toast.error(`Auto-save failed: ${result.error.message}`);
      }
    },
    [eventinfo.id, logger, toast]
  );

  // Form submit handler
  const onSubmitForm: SubmitHandler<EventFormDto> = async (data: EventFormDto) => {
    setApiState({ error: null, loading: true });
    logger.info('Updating event...');
    // Use the organization ID from config
    // Events belong to this organization and we're just maintaining that relationship
    const orgId = publicEnv.NEXT_PUBLIC_ORGANIZATION_ID;
    if (!orgId || Number.isNaN(orgId)) {
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
      <AutoSaveHandler autoSaveEnabled={autoSaveEnabled} onAutoSave={handleAutoSave} />

      {/* Auto-save toggle and status */}
      <div className="mb-6 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={e => setAutoSaveEnabled(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="font-medium text-gray-900 dark:text-gray-100">Enable auto-save</span>
          </label>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Changes will be saved automatically as you type
          </span>
        </div>

        {/* Save status indicator */}
        {saveStatus !== 'idle' && (
          <div className="flex items-center gap-2">
            {saveStatus === 'saving' && (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-600">Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Saved</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <X className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">Save failed</span>
              </>
            )}
          </div>
        )}
      </div>

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
            <ControlledMarkdownInput
              name="description"
              label="Description (max 300 characters)"
              placeholder="An Event Description here (markdown supported)"
              maxLength={300}
            />
            <ControlledMarkdownInput
              name="program"
              label="Program"
              placeholder="An Event Program here (markdown supported)"
            />
            <ControlledMarkdownInput
              name="practicalInformation"
              label="Practical Information"
              placeholder="Practical Information here (markdown supported)"
            />
            <ControlledMarkdownInput
              name="moreInformation"
              label="More Information"
              placeholder="More Information here (markdown supported)"
            />
            <ControlledMarkdownInput
              name="welcomeLetter"
              label="Welcome Letter"
              placeholder="Welcome letter here (markdown supported)"
            />
            <ControlledMarkdownInput
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

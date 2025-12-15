'use client';

import { Fieldset } from '@eventuras/ratio-ui/forms';
import { MarkdownInput } from '@eventuras/scribo';
import {
  CheckboxInput,
  CheckboxLabel,
  Controller,
  HiddenInput,
  Input,
  NumberInput,
  Select,
  useFormContext,
} from '@eventuras/smartform';

import { publicEnv } from '@/config.client';
import { EventDto } from '@/lib/eventuras-sdk';

import { ExcelExportButton } from './ExcelExportButton';
import { AdminCertificatesActionsMenu } from '../AdminCertificatesActionsMenu';

import '@eventuras/scribo/style.css';

export const OverviewSection = ({ loading = false }: { loading?: boolean }) => (
  <>
    <HiddenInput
      name="organizationId"
      value={publicEnv.NEXT_PUBLIC_ORGANIZATION_ID?.toString() ?? ''}
    />
    <Fieldset label="Settings" disabled={loading}>
      <div className="flex flex-row">
        <div className="mr-4">
          <CheckboxInput name="featured">
            <CheckboxLabel>Featured</CheckboxLabel>
          </CheckboxInput>
        </div>
      </div>
    </Fieldset>
    <Fieldset label="Headings" disabled={loading}>
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
        testId="eventeditor-status-select-button"
      />
      <NumberInput name="maxParticipants" label="Max Participants" placeholder="Max Participants" />
    </Fieldset>
    <Fieldset label="Image" disabled={loading}>
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
  </>
);

export const DatesLocationSection = ({ loading = false }: { loading?: boolean }) => (
  <>
    <Fieldset label="Date and time">
      <Input label="Start date:" name="dateStart" type="date" />
      <Input label="End date:" name="dateEnd" type="date" />
      <Input label="Last Registration Date" name="lastRegistrationDate" type="date" />
      <Input label="Last Cancellation Date" name="lastCancellationDate" type="date" />
    </Fieldset>
    <Fieldset label="Location" disabled={loading}>
      <Input name="city" label="City" placeholder="City" />
      <Input name="location" label="Location" placeholder="Location" />
    </Fieldset>
  </>
);

export const DescriptionsSection = () => {
  const formContext = useFormContext();

  // Guard against missing form context
  if (!formContext) {
    return <div className="p-4 text-gray-500">Loading form...</div>;
  }

  const { control } = formContext;

  return (
    <Fieldset label="Additional information">
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <MarkdownInput
            label="Description (max 300 characters)"
            placeholder="An Event Description here (markdown supported)"
            maxLength={300}
            data-testid="eventeditor-markdownfield-description"
            id="eventeditor-description"
            name="description"
            defaultValue={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        name="program"
        control={control}
        render={({ field }) => (
          <MarkdownInput
            label="Program"
            placeholder="An Event Program here (markdown supported)"
            data-testid="eventeditor-markdownfield-program"
            id="eventeditor-program"
            name="program"
            defaultValue={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        name="practicalInformation"
        control={control}
        render={({ field }) => (
          <MarkdownInput
            label="Practical Information"
            placeholder="Practical Information here (markdown supported)"
            data-testid="eventeditor-markdownfield-practical-information"
            id="eventeditor-practical-information"
            name="practicalInformation"
            defaultValue={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        name="moreInformation"
        control={control}
        render={({ field }) => (
          <MarkdownInput
            label="More Information"
            placeholder="More Information here (markdown supported)"
            data-testid="eventeditor-markdownfield-more-information"
            id="eventeditor-more-information"
            name="moreInformation"
            defaultValue={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        name="welcomeLetter"
        control={control}
        render={({ field }) => (
          <MarkdownInput
            label="Welcome Letter"
            placeholder="Welcome letter here (markdown supported)"
            data-testid="eventeditor-markdownfield-welcome-letter"
            id="eventeditor-welcome-letter"
            name="welcomeLetter"
            defaultValue={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        name="informationRequest"
        control={control}
        render={({ field }) => (
          <MarkdownInput
            label="Information Request"
            placeholder="Information Request (markdown supported)"
            data-testid="eventeditor-markdownfield-information-request"
            id="eventeditor-information-request"
            name="informationRequest"
            defaultValue={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </Fieldset>
  );
};

export const CertificateSection = ({ eventinfo }: { eventinfo: EventDto }) => (
  <>
    <Fieldset label="Certificate info">
      <Input name="certificateTitle" label="Certificate Title" placeholder="Certificate Title" />
      <Input
        name="certificateDescription"
        label="Certificate Description"
        placeholder="Certificate Description"
        multiline
        rows={5}
      />
    </Fieldset>
    <div className="mt-6">
      <AdminCertificatesActionsMenu eventinfo={eventinfo} />
    </div>
  </>
);

export const AdvancedSection = ({
  loading = false,
  eventId,
}: {
  loading?: boolean;
  eventId?: number;
}) => (
  <>
    <Fieldset label="Additional Fields" disabled={loading}>
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
    {eventId && (
      <div className="mt-6">
        <ExcelExportButton EventinfoId={eventId} />
      </div>
    )}
  </>
);

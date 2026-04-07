'use client';

import { Logger } from '@eventuras/logger';
import { Select } from '@eventuras/ratio-ui/forms';
import { useToast } from '@eventuras/toast';

import type {
  RegistrationDto,
  RegistrationStatus as RegistrationStatusType,
} from '@/lib/eventuras-types';
import { RegistrationStatus } from '@/lib/eventuras-types';

import { updateRegistrationStatus } from '../registrations/actions';

interface RegistrationStatusSelectProps {
  registration: RegistrationDto;
  onStatusUpdate?: (registration: RegistrationDto) => void;
}

const statusOptions = [
  { value: String(RegistrationStatus.DRAFT), label: 'Draft' },
  { value: String(RegistrationStatus.VERIFIED), label: 'Verified' },
  { value: String(RegistrationStatus.ATTENDED), label: 'Attended' },
  { value: String(RegistrationStatus.NOT_ATTENDED), label: 'Not Attended' },
  { value: String(RegistrationStatus.FINISHED), label: 'Finished' },
  { value: String(RegistrationStatus.WAITING_LIST), label: 'Waiting List' },
  { value: String(RegistrationStatus.CANCELLED), label: 'Cancelled' },
];

const RegistrationStatusSelect = ({
  registration,
  onStatusUpdate,
}: RegistrationStatusSelectProps) => {
  const toast = useToast();
  const logger = Logger.create({
    namespace: 'web:admin:events',
    context: { component: 'RegistrationStatusSelect' },
  });

  const handleStatusChange = async (newStatusStr: string) => {
    const newStatus = Number(newStatusStr) as RegistrationStatusType;
    logger.info(
      { registrationId: registration.registrationId, newStatus },
      'Updating registration status'
    );

    const result = await updateRegistrationStatus(registration.registrationId!, newStatus);

    if (!result.success) {
      toast.error(result.error.message);
      logger.error(
        { error: result.error, registrationId: registration.registrationId },
        'Failed to update registration status'
      );
      return;
    }

    toast.success(result.message || 'Status updated successfully!');
    logger.info(
      { registrationId: registration.registrationId, newStatus },
      'Status updated successfully'
    );

    if (onStatusUpdate && result.data) {
      onStatusUpdate(result.data);
    }
  };

  return (
    <Select
      aria-label="Registration status"
      placeholder="Select status..."
      options={statusOptions}
      value={registration.status !== undefined ? String(registration.status) : undefined}
      onSelectionChange={handleStatusChange}
    />
  );
};

export default RegistrationStatusSelect;

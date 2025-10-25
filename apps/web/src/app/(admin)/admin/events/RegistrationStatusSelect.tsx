'use client';

import { Logger } from '@eventuras/logger';
import { Select } from '@eventuras/ratio-ui/forms';
import { useToast } from '@eventuras/toast';

import type { RegistrationDto } from '@/lib/eventuras-types';
import { RegistrationStatus } from '@/lib/eventuras-types';

import { updateRegistrationStatus } from '../registrations/actions';

interface RegistrationStatusSelectProps {
  registration: RegistrationDto;
  onStatusUpdate?: (registration: RegistrationDto) => void;
}

const statusOptions = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Verified', label: 'Verified' },
  { value: 'Attended', label: 'Attended' },
  { value: 'NotAttended', label: 'Not Attended' },
  { value: 'Finished', label: 'Finished' },
  { value: 'WaitingList', label: 'Waiting List' },
  { value: 'Cancelled', label: 'Cancelled' },
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

  const handleStatusChange = async (newStatus: string) => {
    logger.info(
      { registrationId: registration.registrationId, newStatus },
      'Updating registration status'
    );

    const result = await updateRegistrationStatus(
      registration.registrationId!,
      newStatus as RegistrationStatus
    );

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
      value={registration.status}
      onSelectionChange={handleStatusChange}
    />
  );
};

export default RegistrationStatusSelect;

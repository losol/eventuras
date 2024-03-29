'use client';

import { RegistrationDto, RegistrationStatus } from '@eventuras/sdk';
import Button from '@eventuras/ui/Button';
import { IconCircleX } from '@tabler/icons-react';

import Link from '@/components/Link';

import { statusPatchRequest } from '../registrations/Registration';

interface LiveActionsMenuProps {
  registration: RegistrationDto;
  onStatusUpdate?: (registration: RegistrationDto) => void;
}

const LiveActionsMenu = ({ registration, onStatusUpdate }: LiveActionsMenuProps) => {
  const handleStatusUpdate = (newStatus: RegistrationStatus) => {
    // Send PATCH request to update registration status
    statusPatchRequest(registration.registrationId!, newStatus);

    if (onStatusUpdate) {
      onStatusUpdate({ ...registration, status: newStatus });
    }
  };

  function renderButtonBasedOnStatus() {
    switch (registration.status) {
      case 'Draft':
        return (
          <Button onClick={() => handleStatusUpdate(RegistrationStatus.VERIFIED)}>Verify</Button>
        );
      case 'Verified':
      case 'NotAttended':
        return (
          <Button onClick={() => handleStatusUpdate(RegistrationStatus.ATTENDED)}>Checkin</Button>
        );
      case 'Cancelled':
        return <IconCircleX />;
      default:
        if (registration.certificateId) {
          return (
            <Link
              href={`/admin/certificates/${registration.certificateId}`}
              variant="button-outline"
            >
              🏆
            </Link>
          );
        }
        return (
          <Button onClick={() => handleStatusUpdate(RegistrationStatus.FINISHED)}>Finish</Button>
        );
    }
  }

  return <>{renderButtonBasedOnStatus()}</>;
};

export default LiveActionsMenu;

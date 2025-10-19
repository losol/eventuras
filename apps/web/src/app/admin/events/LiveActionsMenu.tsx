'use client';

import { RegistrationDto, RegistrationStatus, postV3RegistrationsByIdCertificateSend } from '@eventuras/event-sdk';
import { Button } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/logger';
import { IconCircleX } from '@tabler/icons-react';
import { useState } from 'react';

import { Link } from '@eventuras/ratio-ui-next/Link';
import { createClient } from '@/utils/apiClient';

import { statusPatchRequest } from '../registrations/Registration';

interface LiveActionsMenuProps {
  registration: RegistrationDto;
  onStatusUpdate?: (registration: RegistrationDto) => void;
}

const LiveActionsMenu = ({ registration, onStatusUpdate }: LiveActionsMenuProps) => {
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const handleStatusUpdate = (newStatus: RegistrationStatus) => {
    // Send PATCH request to update registration status
    statusPatchRequest(registration.registrationId!, newStatus);

    if (onStatusUpdate) {
      onStatusUpdate({ ...registration, status: newStatus });
    }
  };

  const handleEmailCertificate = async (registrationId: number) => {
    try {
      setEmailLoading(true);
      setEmailError(null);
      setEmailSuccess(false);

      const client = await createClient();

      const response = await postV3RegistrationsByIdCertificateSend({
        path: { id: registrationId },
        client,
      });

      if (!response.data) {
        const errorMessage = response.error ? 'Failed to send certificate' : 'Unknown error';
        throw new Error(errorMessage);
      }

      Logger.info(
        { namespace: 'certificates:email' },
        `Certificate sent successfully for registration ${registrationId}`
      );

      setEmailSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send certificate';
      setEmailError(errorMessage);
      Logger.error(
        { namespace: 'certificates:email' },
        `Failed to send certificate for registration ${registrationId}: ${errorMessage}`
      );
    } finally {
      setEmailLoading(false);
    }
  };

  function renderButtonBasedOnStatus() {
    switch (registration.status) {
      case 'Draft':
        return <Button onClick={() => handleStatusUpdate('Verified')}>Verify</Button>;
      case 'Verified':
      case 'NotAttended':
        return <Button onClick={() => handleStatusUpdate('Attended')}>Checkin</Button>;
      case 'Cancelled':
        return <IconCircleX />;
      default:
        if (registration.certificateId) {
          return (
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/certificates/${registration.certificateId}`}
                variant="button-outline"
              >
                🏆
              </Link>
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => handleEmailCertificate(registration.registrationId!)}
                  disabled={emailLoading}
                >
                  {emailLoading ? '📧...' : '✉️'}
                  {emailSuccess && '✅'}
                </Button>
              </div>
              {emailError && <span className="text-red-500 text-sm">{emailError}</span>}
            </div>
          );
        }
        return <Button onClick={() => handleStatusUpdate('Finished')}>Finish</Button>;
    }
  }

  return <>{renderButtonBasedOnStatus()}</>;
};

export default LiveActionsMenu;

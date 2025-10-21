'use client';

import { RegistrationDto, RegistrationStatus } from '@eventuras/event-sdk';
import { Button } from '@eventuras/ratio-ui';
import { CircleX } from '@eventuras/ratio-ui/icons';
import { Logger } from '@eventuras/logger';
import { useState } from 'react';
import { useToast } from '@eventuras/toast';

import { Link } from '@eventuras/ratio-ui-next/Link';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { updateRegistrationStatus, sendCertificateEmail } from '../registrations/actions';

interface LiveActionsMenuProps {
  registration: RegistrationDto;
  onStatusUpdate?: (registration: RegistrationDto) => void;
}

const LiveActionsMenu = ({ registration }: LiveActionsMenuProps) => {
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const toast = useToast();

  const logger = Logger.create({
    namespace: 'web:admin:events',
    context: { component: 'LiveActionsMenu' },
  });

  const handleStatusUpdate = async (newStatus: RegistrationStatus) => {
    // TODO: This functionality is not yet fully implemented
    toast.error('Status update not yet implemented. Please use the registration edit page.');
    logger.warn(
      { registrationId: registration.registrationId, newStatus },
      'Status update attempted but not implemented'
    );

    // When ready, uncomment:
    // const result = await updateRegistrationStatus(registration.registrationId!, newStatus);
    //
    // if (!result.success) {
    //   toast.error(result.error.message);
    //   logger.error({ error: result.error }, 'Failed to update registration status');
    //   return;
    // }
    //
    // toast.success(result.message || 'Status updated successfully!');
    // if (onStatusUpdate) {
    //   onStatusUpdate({ ...registration, status: newStatus });
    // }
  };

  const handleEmailCertificate = async (registrationId: number) => {
    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(false);

    logger.info({ registrationId }, 'Sending certificate email');

    const result = await sendCertificateEmail(registrationId);

    if (!result.success) {
      const errorMessage = result.error.message;
      setEmailError(errorMessage);
      toast.error(errorMessage);
      logger.error({ error: result.error, registrationId }, 'Failed to send certificate');
      setEmailLoading(false);
      return;
    }

    logger.info({ registrationId }, 'Certificate sent successfully');
    toast.success(result.message || 'Certificate sent successfully!');
    setEmailSuccess(true);
    setEmailLoading(false);
  };

  function renderButtonBasedOnStatus() {
    switch (registration.status) {
      case 'Draft':
        return <Button onClick={() => handleStatusUpdate('Verified')}>Verify</Button>;
      case 'Verified':
      case 'NotAttended':
        return <Button onClick={() => handleStatusUpdate('Attended')}>Checkin</Button>;
      case 'Cancelled':
        return <CircleX />;
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

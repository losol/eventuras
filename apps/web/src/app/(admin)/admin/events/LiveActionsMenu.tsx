'use client';
import { useState } from 'react';

import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { CircleX } from '@eventuras/ratio-ui/icons';
import { Link } from '@eventuras/ratio-ui-next/Link';
import { useToast } from '@eventuras/toast';

import { RegistrationDto, RegistrationStatus } from '@/lib/eventuras-sdk';

import { sendCertificateEmail, updateRegistrationStatus } from '../registrations/actions';
interface LiveActionsMenuProps {
  registration: RegistrationDto;
  onStatusUpdate?: (registration: RegistrationDto) => void;
}

const LiveActionsMenu = ({ registration, onStatusUpdate }: LiveActionsMenuProps) => {
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const toast = useToast();
  const logger = Logger.create({
    namespace: 'web:admin:events',
    context: { component: 'LiveActionsMenu' },
  });
  const handleStatusUpdate = async (newStatus: RegistrationStatus) => {
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

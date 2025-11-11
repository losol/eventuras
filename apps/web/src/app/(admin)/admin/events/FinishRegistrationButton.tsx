'use client';

import { useState } from 'react';

import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Loading } from '@eventuras/ratio-ui/core/Loading';
import { useToast } from '@eventuras/toast';

import type { RegistrationDto } from '@/lib/eventuras-types';
import { RegistrationStatus } from '@/lib/eventuras-types';

import { updateRegistrationStatus } from '../registrations/actions';

interface FinishRegistrationButtonProps {
  registration: RegistrationDto;
  onStatusUpdate?: (registration: RegistrationDto) => void;
}

export function FinishRegistrationButton({
  registration,
  onStatusUpdate,
}: FinishRegistrationButtonProps) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const logger = Logger.create({
    namespace: 'web:admin:events',
    context: { component: 'FinishRegistrationButton' },
  });

  const isFinished = registration.status === RegistrationStatus.FINISHED;
  const isCancelled = registration.status === RegistrationStatus.CANCELLED;
  const isNotAttended = registration.status === RegistrationStatus.NOT_ATTENDED;

  const handleClick = async () => {
    if (submitting || isFinished || isCancelled || isNotAttended || !registration.registrationId)
      return;

    setSubmitting(true);
    logger.info(
      { registrationId: registration.registrationId },
      'Setting registration status to Finished'
    );

    const result = await updateRegistrationStatus(
      registration.registrationId,
      RegistrationStatus.FINISHED
    );

    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error.message || 'Failed to finish registration');
      logger.error(
        { error: result.error, registrationId: registration.registrationId },
        'Failed to set status to Finished'
      );
      return;
    }

    toast.success(result.message || 'Registration marked as Finished');
    logger.info({ registrationId: registration.registrationId }, 'Registration marked as Finished');

    if (onStatusUpdate && result.data) {
      onStatusUpdate(result.data);
    }
  };

  const isDisabled = isFinished || isCancelled || isNotAttended || submitting;
  const variant = isFinished || isCancelled || isNotAttended ? 'outline' : 'primary';
  let buttonTitle = 'Mark as Finished';
  if (isFinished) {
    buttonTitle = 'Already Finished';
  } else if (isCancelled) {
    buttonTitle = 'Cannot finish a Cancelled registration';
  } else if (isNotAttended) {
    buttonTitle = 'Cannot finish a Not Attended registration';
  }

  return (
    <Button
      variant={variant}
      disabled={isDisabled}
      onClick={handleClick}
      aria-label="Mark as Finished"
      title={buttonTitle}
    >
      {submitting ? <Loading /> : 'Finish'}
    </Button>
  );
}

export default FinishRegistrationButton;

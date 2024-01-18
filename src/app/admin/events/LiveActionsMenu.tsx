'use client';
import { RegistrationDto } from '@losol/eventuras';

import Button from '@/components/ui/Button';
import Logger from '@/utils/Logger';

interface LiveActionsMenuProps {
  registration: RegistrationDto;
}

// This component shows a checkin Button if registration.status is Draft, Verified or NotAttended.
// Sends http json patch request to /registrations/{registrationId} with status: Attended
// if registration status i Attended, it shows a Button with possibility to change status to Finished
const LiveActionsMenu = ({ registration }: LiveActionsMenuProps) => {
  const logger_namespace = 'admin:eventparticipantlist';
  const handleVerify = () => {
    Logger.info(
      { namespace: logger_namespace },
      `Verifying registration ${registration.registrationId}`
    );
  };
  const handleAttend = () => {
    Logger.info(
      { namespace: logger_namespace },
      `Marking registration ${registration.registrationId} as attended`
    );
  };
  const handleFinish = () => {
    Logger.info(
      { namespace: logger_namespace },
      `Marking registration ${registration.registrationId} as finished`
    );
  };

  function renderButtonBasedOnStatus() {
    switch (registration.status) {
      case 'Draft':
        return <Button onClick={handleVerify}>Verify</Button>;
      case 'Verified':
      case 'NotAttended':
        return <Button onClick={handleAttend}>Checkin</Button>;
      default:
        return <Button onClick={handleFinish}>Finish</Button>;
    }
  }

  return <>{renderButtonBasedOnStatus()}</>;
};

export default LiveActionsMenu;

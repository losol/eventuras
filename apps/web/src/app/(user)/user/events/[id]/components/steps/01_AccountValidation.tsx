'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import UserEditor from '@/app/(admin)/admin/users/UserEditor';
import { UserDto } from '@/lib/eventuras-sdk';

import { logStepComplete, logStepEntry } from '../../lib/eventFlowLogger';

export type Step01AccountValidationProps = {
  user: UserDto;
  onUserUpdated: (updatedUser: UserDto) => void;
};

const Step01AccountValidation = ({ user, onUserUpdated }: Step01AccountValidationProps) => {
  const t = useTranslations();

  useEffect(() => {
    logStepEntry('01', 'AccountValidation', {
      userId: user.id,
      userName: user.name,
    });
  }, [user.id, user.name]);

  const handleUserUpdated = (updatedUser: UserDto) => {
    logStepComplete('01', 'AccountValidation', {
      userId: updatedUser.id,
    });
    onUserUpdated(updatedUser);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <UserEditor
        user={user}
        onUserUpdated={handleUserUpdated}
        submitButtonLabel={t('common.labels.next')}
        testId="registration-account-step"
      />
    </div>
  );
};

export default Step01AccountValidation;

'use client';

import createTranslation from 'next-translate/createTranslation';

import Button from '@/components/ui/Button';

export type RegistrationCompleteProps = {
  onSubmit: () => void;
};
const RegistrationComplete = ({ onSubmit }: RegistrationCompleteProps) => {
  const { t } = createTranslation();
  return (
    <>
      <p data-test-id="registration-complete-confirmation">
        {t('user:registration.complete.description')}
      </p>
      <Button onClick={() => onSubmit()} data-test-id="registration-complete-submit-button">
        {t('common:buttons.homepage')}
      </Button>
    </>
  );
};

export default RegistrationComplete;

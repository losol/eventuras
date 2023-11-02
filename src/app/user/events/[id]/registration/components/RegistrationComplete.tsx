import createTranslation from 'next-translate/createTranslation';

import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';

export type RegistrationCompleteProps = {
  onSubmit: () => void;
};
const RegistrationComplete = ({ onSubmit }: RegistrationCompleteProps) => {
  const { t } = createTranslation();
  return (
    <>
      <Heading>{t('registration:complete.title')}</Heading>
      <p>{t('registration:complete.description')}</p>
      <Button onClick={() => onSubmit()}>Continue</Button>
    </>
  );
};

export default RegistrationComplete;

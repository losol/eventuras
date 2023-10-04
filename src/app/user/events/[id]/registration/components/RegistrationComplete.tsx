import useTranslation from 'next-translate/useTranslation';

import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';

export type RegistrationCompleteProps = {
  onSubmit: () => void;
};
const RegistrationComplete = ({ onSubmit }: RegistrationCompleteProps) => {
  const { t } = useTranslation('register');
  return (
    <>
      <Heading>{t('complete.title')}</Heading>
      <p>{t('complete.description')}</p>
      <Button onClick={() => onSubmit()}>Continue</Button>
    </>
  );
};

export default RegistrationComplete;

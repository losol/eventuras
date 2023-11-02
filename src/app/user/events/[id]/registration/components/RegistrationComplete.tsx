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
      <Heading>{t('user:registration.complete.title')}</Heading>
      <p>{t('user:registration.complete.description')}</p>
      <Button onClick={() => onSubmit()}>{t('common:buttons.continue')}</Button>
    </>
  );
};

export default RegistrationComplete;

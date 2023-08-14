import { Heading } from 'components/content';
import { Button } from 'components/inputs';
import useTranslation from 'next-translate/useTranslation';

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

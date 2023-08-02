import { Button, Heading } from '@chakra-ui/react';
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
      <Button colorScheme="teal" variant="solid" width="100%" onClick={() => onSubmit()}>
        Continue
      </Button>
    </>
  );
};

export default RegistrationComplete;

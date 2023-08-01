import { Button, Heading } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';

export type RegistrationPaymentProps = {
  onSubmit: Function;
};
const RegistrationPayment = ({ onSubmit }: RegistrationPaymentProps) => {
  const { t } = useTranslation('register');
  return (
    <>
      <Heading>{t('payment.title')}</Heading>
      <p>{t('payment.description')}</p>
      <Button
        colorScheme="teal"
        variant="solid"
        width="100%"
        onClick={() => onSubmit()}
      >
        Continue
      </Button>
    </>
  );
};

export default RegistrationPayment;

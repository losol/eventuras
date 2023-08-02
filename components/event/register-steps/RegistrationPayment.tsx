/* TODO 

- styling and where to put it - really depends on future, whether we go for tailwind or not
- validation and handling 

*/
import { Box, Button, Heading } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { Radio, RadioGroup, Stack, Text, Input } from '@chakra-ui/react';
import { useState } from 'react';

export type RegistrationPaymentOptions = 'payment-me' | 'payment-employer';

export type PaymentDetails = {
  companyName: string;
  companyIdentity: string;
  invoiceEmail: string;
  invoiceRef: string;
  cityName: string;
  zipCode: string;
};

export type RegistrationSubmitValues = {
  paymentOption: RegistrationPaymentOptions;
  paymentDetails: PaymentDetails | null;
};
export type RegistrationPaymentProps = {
  onSubmit: (values: RegistrationSubmitValues) => void;
};

const RegistrationPayment = ({ onSubmit }: RegistrationPaymentProps) => {
  const { t } = useTranslation('register');
  const [paymentOption, setPaymentOption] = useState<RegistrationPaymentOptions>('payment-me');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  const generateInputFieldStateUpdater = (fieldName: string) => {
    return (event: any) => {
      setPaymentDetails((prevState: PaymentDetails | null) => {
        return {
          ...prevState,
          [fieldName]: event.target.value,
        } as PaymentDetails;
      });
    };
  };

  const renderForm = () => (
    <>
      <Box mb="20px">
        <Text mb="10px">Company</Text>
        <Input
          mb="5px"
          placeholder="Company Name"
          value={paymentDetails?.companyName ?? ''}
          onChange={generateInputFieldStateUpdater('companyName')}
        />
        <Input
          placeholder="Company Identity Number"
          value={paymentDetails?.companyIdentity ?? ''}
          onChange={generateInputFieldStateUpdater('companyIdentity')}
        />
      </Box>
      <Box></Box>
      <Box mb="20px">
        <Text mb="10px">Invoice</Text>
        <Input
          mb="5px"
          placeholder="Email for invoice"
          value={paymentDetails?.invoiceEmail ?? ''}
          onChange={generateInputFieldStateUpdater('invoiceEmail')}
        />
        <Input
          mb="5px"
          placeholder="Invoice ref"
          value={paymentDetails?.invoiceRef ?? ''}
          onChange={generateInputFieldStateUpdater('invoiceRef')}
        />
      </Box>
      <Box mb="20px">
        <Text mb="10px">Address</Text>
        <Input
          mb="5px"
          placeholder="City Name"
          value={paymentDetails?.cityName ?? ''}
          onChange={generateInputFieldStateUpdater('cityName')}
        />
        <Input
          placeholder="Zip Code"
          value={paymentDetails?.zipCode ?? ''}
          onChange={generateInputFieldStateUpdater('zipCode')}
        />
      </Box>
    </>
  );
  return (
    <>
      <Heading>{t('payment.title')}</Heading>
      <p>{t('payment.description')}</p>
      <p>{t('payment.subHeading')}</p>
      <RadioGroup
        onChange={(value: RegistrationPaymentOptions) => {
          setPaymentOption(value);
        }}
        value={paymentOption}
        colorScheme="teal"
      >
        <Stack direction="column">
          <Radio value="payment-me">Me! Send me an invoice by email</Radio>
          <Radio value="payment-employer">My employer</Radio>
        </Stack>
      </RadioGroup>
      {paymentOption === 'payment-employer' && renderForm()}
      <Button
        colorScheme="teal"
        variant="solid"
        width="100%"
        onClick={() => onSubmit({ paymentOption, paymentDetails })}
        mt="20px"
        mb="20px"
      >
        Continue
      </Button>
    </>
  );
};

export default RegistrationPayment;

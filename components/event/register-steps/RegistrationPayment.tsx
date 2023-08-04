import { Box, Input, Radio, Stack } from '@mantine/core';
import { Button } from 'components/inputs';
import { Layout } from 'components/layout';
import { Heading, Text } from 'components/typography';
import useTranslation from 'next-translate/useTranslation';
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
    <Layout>
      <Box>
        <Text>Company</Text>
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
        <Text>Invoice</Text>
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
        <Text>Address</Text>
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
    </Layout>
  );
  return (
    <Layout>
      <Heading>{t('payment.title')}</Heading>
      <p>{t('payment.description')}</p>
      <p>{t('payment.subHeading')}</p>
      <Radio.Group
        onChange={(value: RegistrationPaymentOptions) => {
          setPaymentOption(value);
        }}
        value={paymentOption}
      >
        <Stack>
          <Radio value="payment-me">Me! Send me an invoice by email</Radio>
          <Radio value="payment-employer">My employer</Radio>
        </Stack>
      </Radio.Group>
      {paymentOption === 'payment-employer' && renderForm()}
      <Button onClick={() => onSubmit({ paymentOption, paymentDetails })}>Continue</Button>
    </Layout>
  );
};

export default RegistrationPayment;

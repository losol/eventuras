'use client';

import { Heading, Text } from 'components/content';
import { Button } from 'components/inputs';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
      <div>
        <Text>Company</Text>
        <Input
          className="mb-5"
          placeholder="Company Name"
          value={paymentDetails?.companyName ?? ''}
          onChange={generateInputFieldStateUpdater('companyName')}
        />
        <Input
          placeholder="Company Identity Number"
          value={paymentDetails?.companyIdentity ?? ''}
          onChange={generateInputFieldStateUpdater('companyIdentity')}
        />
      </div>
      <div className="mb-5">
        <Text>Invoice</Text>
        <Input
          type="email"
          className="mb-5"
          placeholder="Email for invoice"
          value={paymentDetails?.invoiceEmail ?? ''}
          onChange={generateInputFieldStateUpdater('invoiceEmail')}
        />
        <Input
          className="mb-5"
          placeholder="Invoice ref"
          value={paymentDetails?.invoiceRef ?? ''}
          onChange={generateInputFieldStateUpdater('invoiceRef')}
        />
      </div>
      <div className="mb-5">
        <Text>Address</Text>
        <Input
          className="mb-5"
          placeholder="City Name"
          value={paymentDetails?.cityName ?? ''}
          onChange={generateInputFieldStateUpdater('cityName')}
        />
        <Input
          placeholder="Zip Code"
          value={paymentDetails?.zipCode ?? ''}
          onChange={generateInputFieldStateUpdater('zipCode')}
        />
      </div>
    </>
  );

  return (
    <>
      <Heading>{t('payment.title')}</Heading>
      <Text>{t('payment.description')}</Text>
      <Text>{t('payment.subHeading')}</Text>
      <RadioGroup
        value={paymentOption}
        onValueChange={value => {
          setPaymentOption(value as RegistrationPaymentOptions);
        }}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="payment-me" id="payment-me" />
          <Label htmlFor="payment-me">Me! Send me an invoice by email</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="payment-employer" id="payment-employer" />
          <Label htmlFor="payment-employer">My employer</Label>
        </div>
      </RadioGroup>
      {paymentOption === 'payment-employer' && renderForm()}
      <Button onClick={() => onSubmit({ paymentOption, paymentDetails })}>Continue</Button>
    </>
  );
};

export default RegistrationPayment;

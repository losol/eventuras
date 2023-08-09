import { Heading } from 'components/content';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import { RegisterOptions, useForm } from 'react-hook-form';

type InputParams = {
  ph: string; //placeholder
  id: string; //identifier
  opt?: RegisterOptions; //registration options
};


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
  const { register, handleSubmit } = useForm();
  const onSubmitForm = (data: any) => {
    console.log(data);
  };
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
  const generateTextInput = (params: InputParams) => {
    const inputClass =
      'mb-3 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline';
    return (
      <input
        {...register(params.id, params.opt)}
        placeholder={params.ph}
        className={inputClass}
        value={(paymentDetails as any)?.[params.id] ?? ''}
        onChange={generateInputFieldStateUpdater(params.id)}
      />
    );
  };

  return <>
     <Heading>{t('payment.title')}</Heading>
     <p>{t('payment.description')}</p>
     <form onSubmit={handleSubmit(onSubmitForm)} className="shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {generateTextInput({
        id: 'username',
        ph: 'Company Name',
        opt: { required: true, maxLength: 20 },
      })}
     </form>
  </>
}

/*
const RegistrationPayment = ({ onSubmit }: RegistrationPaymentProps) => {
  const { t } = useTranslation('register');
  const { register, handleSubmit } = useForm();
  const onSubmitForm = (data: any) => {
    console.log(data);
  };
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
  const generateTextInput = (params: InputParams) => {
    const inputClass =
      'mb-3 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline';
    return (
      <input
        {...register(params.id, params.opt)}
        placeholder={params.ph}
        className={inputClass}
        value={(paymentDetails as any)?.[params.id] ?? ''}
        onChange={generateInputFieldStateUpdater(params.id)}
      />
    );
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit(onSubmitForm)} className="shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {generateTextInput({
        id: 'companyName',
        ph: 'Company Name',
        opt: { required: true, maxLength: 20 },
      })}
      {generateTextInput({
        id: 'companyIdentity',
        ph: 'Company Identity Number',
        opt: { required: true, pattern: /^[A-Za-z]+$/i },
      })}
      {generateTextInput({
        id: 'invoiceEmail',
        ph: 'Email for invoice',
        opt: { required: true, pattern: /^[A-Za-z]+$/i },
      })}
      {generateTextInput({
        id: 'invoiceRef',
        ph: 'Invoice Ref',
        opt: { required: true, pattern: /^[A-Za-z]+$/i },
      })}
      {generateTextInput({
        id: 'cityName',
        ph: 'City Name',
        opt: { required: true, pattern: /^[A-Za-z]+$/i },
      })}
      {generateTextInput({
        id: 'zipCode',
        ph: 'Zip Code',
        opt: { required: true, pattern: /^[A-Za-z]+$/i },
      })}
    </form>
  );
  return (
    <>
      <Heading>{t('payment.title')}</Heading>
      <p>{t('payment.description')}</p>

      <fieldset>
        <legend>{t('payment.subHeading')}</legend>
        <ul className="flex flex-col">
          <li>
            <input
              type="radio"
              id="invoiceme"
              name="invoice"
              value="payment-me"
              checked={paymentOption === 'payment-me'}
              onChange={e => {
                setPaymentOption(e.target.value as RegistrationPaymentOptions);
              }}
            />
            <label htmlFor="invoiceme">Me! Send me an invoice by email</label>
          </li>
          <li>
            <input
              type="radio"
              id="invoiceemployer"
              name="invoice"
              value="payment-employer"
              checked={paymentOption === 'payment-employer'}
              onChange={e => {
                setPaymentOption(e.target.value as RegistrationPaymentOptions);
              }}
            />

            <label htmlFor="invoiceemployer">My Employer</label>
          </li>
        </ul>
      </fieldset>
      {paymentOption === 'payment-employer' && renderForm()}
    </>
  );
};


*/
export default RegistrationPayment;

import { PaymentProvider } from '@losol/eventuras';
import useTranslation from 'next-translate/useTranslation';
import { SubmitHandler, useForm } from 'react-hook-form';

import { Heading } from '@/components/content';
import { Button } from '@/components/inputs';
import { InputText } from '@/components/inputs/Input';
import PaymentFormValues from '@/types/PaymentFormValues';
import { UserProfile } from '@/types/UserProfile';

export type RegistrationPaymentProps = {
  onSubmit: (values: PaymentFormValues) => void;
  userProfile: UserProfile;
};

const RegistrationPayment = ({ userProfile, onSubmit }: RegistrationPaymentProps) => {
  const { t } = useTranslation('register');
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<PaymentFormValues>();

  const onSubmitForm: SubmitHandler<PaymentFormValues> = (data: PaymentFormValues) => {
    onSubmit(data);
  };

  return (
    <>
      <Heading>{t('payment.title')}</Heading>
      <p>{t('payment.description')}</p>
      <form onSubmit={handleSubmit(onSubmitForm)} className="shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <InputText
          {...register('username', { value: userProfile.name })}
          defaultValue={userProfile.name}
          disabled
          errors={errors}
        />
        <InputText
          {...register('email', { value: userProfile.email })}
          defaultValue={userProfile.email}
          disabled
          errors={errors}
        />
        <InputText
          {...register('zip', {
            required: 'Zip code is Required',
          })}
          placeholder="Zip Code"
          errors={errors}
        />
        <InputText
          {...register('city', {
            required: 'City is required',
          })}
          placeholder="City"
          errors={errors}
        />

        <InputText
          {...register('country', {
            required: 'Country is required',
          })}
          placeholder="Country"
          errors={errors}
        />

        <InputText
          {...register('vatNumber', {
            required: 'Vat Number is required',
          })}
          placeholder="Vat Number"
          errors={errors}
        />

        <InputText
          {...register('invoiceReference', {
            required: 'Invoice Reference is required',
          })}
          placeholder="Invoice Reference"
          errors={errors}
        />
        <fieldset>
          <ul className="flex flex-col">
            <li>
              <input
                type="radio"
                id="emailinvoice"
                value={PaymentProvider.POWER_OFFICE_EMAIL_INVOICE}
                defaultChecked={true}
                {...register('paymentMethod')}
              />
              <label htmlFor="emailinvoice">Email Invoice</label>
            </li>
            <li>
              <input
                type="radio"
                id="ehfInvoice"
                value={PaymentProvider.POWER_OFFICE_EHFINVOICE}
                {...register('paymentMethod')}
              />
              <label htmlFor="ehfInvoice">Electronic Invoice</label>
            </li>
          </ul>
        </fieldset>
        <Button type="submit">Continue</Button>
      </form>
    </>
  );
};
export default RegistrationPayment;

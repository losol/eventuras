import { PaymentProvider } from '@losol/eventuras';
import useTranslation from 'next-translate/useTranslation';
import { FieldErrors, SubmitHandler, useForm } from 'react-hook-form';

import { Heading } from '@/components/content';
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

  const generateError = (identifier: keyof FieldErrors<PaymentFormValues>) => (
    <p role="alert" className="text-red-500">
      {errors[identifier]?.message}
    </p>
  );

  const inputClass =
    'mb-3 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline';
  return (
    <>
      <Heading>{t('payment.title')}</Heading>
      <p>{t('payment.description')}</p>
      <form onSubmit={handleSubmit(onSubmitForm)} className="shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <input
          {...register('username', { value: userProfile.name })}
          defaultValue={userProfile.name}
          disabled
          className={inputClass}
        />
        <input
          {...register('email', { value: userProfile.email })}
          defaultValue={userProfile.email}
          disabled
          className={inputClass}
        />
        <input
          {...register('zip', {
            required: 'Zip code is Required',
          })}
          placeholder="Zip Code"
          className={inputClass}
        />
        {generateError('zip')}
        <input
          {...register('city', {
            required: 'City is required',
          })}
          placeholder="City"
          className={inputClass}
        />
        {generateError('city')}

        <input
          {...register('country', {
            required: 'Country is required',
          })}
          placeholder="Country"
          className={inputClass}
        />
        {generateError('country')}

        <input
          {...register('vatNumber', {
            required: 'Vat Number is required',
          })}
          placeholder="Vat Number"
          className={inputClass}
        />
        {generateError('vatNumber')}

        <input
          {...register('invoiceReference', {
            required: 'Invoice Reference is required',
          })}
          placeholder="Invoice Reference"
          className={inputClass}
        />
        {generateError('invoiceReference')}

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
        <button type="submit">Continue</button>
      </form>
    </>
  );
};
export default RegistrationPayment;

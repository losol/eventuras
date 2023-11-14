'use client';

import { PaymentProvider, UserDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { defaultInputStyle, InputText } from '@/components/forms/Input';
import Button from '@/components/ui/Button';
import PaymentFormValues from '@/types/PaymentFormValues';

export type RegistrationPaymentProps = {
  onSubmit: (values: PaymentFormValues) => void;
  userProfile: UserDto;
};

const RegistrationPayment = ({ userProfile, onSubmit }: RegistrationPaymentProps) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<PaymentFormValues>();

  const [showBusinessFieldset, setShowBusinessFieldset] = useState(false);

  const selectedPaymentMethod = watch('paymentMethod');

  useEffect(() => {
    // Use useEffect to update showBusinessFieldset after initial render
    if (selectedPaymentMethod === PaymentProvider.POWER_OFFICE_EHFINVOICE) {
      setShowBusinessFieldset(true);
    } else {
      setShowBusinessFieldset(false);
    }
  }, [selectedPaymentMethod]);

  const onSubmitForm: SubmitHandler<PaymentFormValues> = (data: PaymentFormValues) => {
    onSubmit(data);
  };
  const { t } = createTranslation();

  const formClassName = 'px-8 pt-6 pb-8 mb-4';
  const fieldsetClassName = 'text-lg pt-3 pb-6';
  const fieldsetLegendClassName = 'text-lg border-b-2 pt-4 pb-2';

  return (
    <>
      <form onSubmit={handleSubmit(onSubmitForm)} className={formClassName}>
        <fieldset className={fieldsetClassName}>
          <legend className={fieldsetLegendClassName}>
            {t('user:registration.customertype.legend')}
          </legend>
          <ul className="flex flex-col">
            <li>
              <input
                type="radio"
                id="emailinvoice"
                value={PaymentProvider.POWER_OFFICE_EMAIL_INVOICE}
                data-test-id="registration-emailinvoice-input"
                defaultChecked={true}
                {...register('paymentMethod')}
              />
              <label htmlFor="emailinvoice">{t('user:registration.customertype.private')}</label>
            </li>
            <li>
              <input
                type="radio"
                id="ehfInvoice"
                data-test-id="registration-ehfinvoice-input"
                value={PaymentProvider.POWER_OFFICE_EHFINVOICE}
                {...register('paymentMethod')}
              />
              <label htmlFor="ehfInvoice">{t('user:registration.customertype.business')}</label>
            </li>
          </ul>
        </fieldset>

        <fieldset className={fieldsetClassName}>
          <legend className={fieldsetLegendClassName}>{t('user:registration.user.legend')}</legend>
          <InputText
            {...register('username', { value: userProfile.name! })}
            label={t('user:registration.user.name')}
            defaultValue={userProfile.name}
            disabled
            errors={errors}
            className={defaultInputStyle}
          />
          <InputText
            {...register('email', { value: userProfile.email! })}
            label={t('user:registration.user.email')}
            defaultValue={userProfile.email}
            disabled
            errors={errors}
            className={defaultInputStyle}
          />
        </fieldset>
        <fieldset className={fieldsetClassName}>
          <legend className={fieldsetLegendClassName}>
            {t('user:registration.address.legend')}
          </legend>
          <InputText
            {...register('zip', {
              required: 'Zip code is Required',
            })}
            label={t('user:registration.address.zip')}
            data-test-id="registration-zipcode-input"
            placeholder="Zip Code"
            errors={errors}
            className={defaultInputStyle}
          />
          <InputText
            {...register('city', {
              required: 'City is required',
            })}
            label={t('user:registration.address.city')}
            data-test-id="registration-city-input"
            placeholder="City"
            errors={errors}
            className={defaultInputStyle}
          />
          <InputText
            {...register('country', {
              required: 'Country is required',
            })}
            label={t('user:registration.address.country')}
            data-test-id="registration-country-input"
            default="Norway"
            placeholder="Country"
            errors={errors}
            className={defaultInputStyle}
          />
        </fieldset>

        {showBusinessFieldset && (
          <fieldset className={fieldsetClassName}>
            <legend className={fieldsetLegendClassName}>
              {t('user:registration.businessinfo.legend')}
            </legend>
            <InputText
              {...register('vatNumber', {
                required: 'Vat Number is required for business customers',
              })}
              label={t('user:registration.businessinfo.vatNumber')}
              data-test-id="registration-vat-input"
              placeholder="Vat Number"
              errors={errors}
              className={defaultInputStyle}
            />
            <InputText
              {...register('invoiceReference')}
              label={t('user:registration.businessinfo.invoiceReference')}
              placeholder="Invoice Reference"
              errors={errors}
              className={defaultInputStyle}
            />
          </fieldset>
        )}

        <Button data-test-id="registration-payment-submit-button" type="submit">
          {t('common:buttons.continue')}
        </Button>
      </form>
    </>
  );
};

export default RegistrationPayment;

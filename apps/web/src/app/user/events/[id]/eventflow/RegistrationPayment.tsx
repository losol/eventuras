'use client';

import { Input } from '@eventuras/forms';
import { PaymentProvider, UserDto } from '@eventuras/sdk';
import { Button } from '@eventuras/ui';
import { DATA_TEST_ID } from '@eventuras/utils';
import { getTranslations } from 'next-intl/server';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { PaymentFormValues } from '@/types';

export type RegistrationPaymentProps = {
  onSubmit: (values: PaymentFormValues) => void;
  onBack?: () => void;
  userProfile: UserDto;
  initialValues?: PaymentFormValues;
};

const RegistrationPayment = ({
  userProfile,
  onSubmit,
  onBack,
  initialValues,
}: RegistrationPaymentProps) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
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

  useEffect(() => {
    // reuse initial values if given
    if (initialValues) {
      const formKeys = Object.keys(initialValues) as Array<keyof PaymentFormValues>;
      formKeys.forEach(key => {
        setValue(key, initialValues[key]);
      });
    }
  }, [initialValues]);

  const onSubmitForm: SubmitHandler<PaymentFormValues> = (data: PaymentFormValues) => {
    onSubmit(data);
  };
  const t = await getTranslations();

  const formClassName = 'px-8 pt-6 pb-8 mb-4';
  const fieldsetClassName = 'text-lg pt-3 pb-6';
  const fieldsetLegendClassName = 'text-lg border-b-2 pt-4 pb-2';

  return (
    <>
      <form onSubmit={handleSubmit(onSubmitForm)} className={formClassName}>
        <fieldset className={fieldsetClassName}>
          <legend className={fieldsetLegendClassName}>
            {t('user.registration.customertype.legend')}
          </legend>
          <ul className="flex flex-col">
            <li>
              <input
                type="radio"
                id="emailinvoice"
                value={PaymentProvider.POWER_OFFICE_EMAIL_INVOICE}
                {...{ [DATA_TEST_ID]: 'registration-emailinvoice-input' }}
                defaultChecked={true}
                {...register('paymentMethod')}
              />
              <label htmlFor="emailinvoice">{t('user.registration.customertype.private')}</label>
            </li>
            <li>
              <input
                type="radio"
                id="ehfInvoice"
                {...{ [DATA_TEST_ID]: 'registration-ehfinvoice-input' }}
                value={PaymentProvider.POWER_OFFICE_EHFINVOICE}
                {...register('paymentMethod')}
              />
              <label htmlFor="ehfInvoice">{t('user.registration.customertype.business')}</label>
            </li>
          </ul>
        </fieldset>

        <fieldset className={fieldsetClassName}>
          <legend className={fieldsetLegendClassName} hidden>
            {t('user.registration.user.legend')}
          </legend>
          <Input
            {...register('username', { value: userProfile.name! })}
            label={t('user.registration.user.name')}
            defaultValue={userProfile.name}
            disabled
            errors={errors}
            hidden
          />
          <Input
            {...register('email', { value: userProfile.email! })}
            label={t('user.registration.user.email')}
            defaultValue={userProfile.email}
            disabled
            errors={errors}
            hidden
          />
          <Input
            {...register('phoneNumber', { value: userProfile.phoneNumber! })}
            label={t('user.registration.user.phoneNumber')}
            defaultValue={userProfile.phoneNumber}
            disabled
            errors={errors}
            hidden
          />
        </fieldset>
        <fieldset className={fieldsetClassName}>
          <legend className={fieldsetLegendClassName}>
            {t('user.registration.address.legend')}
          </legend>
          <Input
            {...register('zip', {
              required: 'Zip code is Required',
            })}
            label={t('user.registration.address.zip')}
            {...{ [DATA_TEST_ID]: 'registration-zipcode-input' }}
            placeholder="Zip Code"
            errors={errors}
          />
          <Input
            {...register('city', {
              required: 'City is required',
            })}
            label={t('user.registration.address.city')}
            {...{ [DATA_TEST_ID]: 'registration-city-input' }}
            placeholder="City"
            errors={errors}
          />
          <Input
            {...register('country', {
              required: 'Country is required',
            })}
            label={t('user.registration.address.country')}
            {...{ [DATA_TEST_ID]: 'registration-country-input' }}
            default="Norway"
            placeholder="Country"
            errors={errors}
          />
        </fieldset>

        {showBusinessFieldset && (
          <fieldset className={fieldsetClassName}>
            <legend className={fieldsetLegendClassName}>
              {t('user.registration.businessinfo.legend')}
            </legend>
            <Input
              {...register('vatNumber', {
                required: 'Vat Number is required for business customers',
              })}
              label={t('user.registration.businessinfo.vatNumber')}
              {...{ [DATA_TEST_ID]: 'registration-vat-input' }}
              placeholder="Vat Number"
              errors={errors}
            />
            <Input
              {...register('invoiceReference')}
              label={t('user.registration.businessinfo.invoiceReference')}
              placeholder="Invoice Reference"
              errors={errors}
            />
          </fieldset>
        )}
        {onBack && (
          <Button type="button" onClick={onBack} variant="outline">
            {t('common.buttons.back')}
          </Button>
        )}
        <Button
          {...{ [DATA_TEST_ID]: 'registration-payment-submit-button' }}
          type="submit"
          variant="primary"
        >
          {t('common.buttons.continue')}
        </Button>
      </form>
    </>
  );
};

export default RegistrationPayment;

'use client';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { UserDto } from '@eventuras/event-sdk';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Input } from '@eventuras/ratio-ui/forms';

import { PaymentFormValues } from '@/types';

import { logStepComplete, logStepEntry, logUserAction } from '../../lib/eventFlowLogger';
export type Step03PaymentConfigurationProps = {
  onSubmit: (values: PaymentFormValues) => void;
  onBack?: () => void;
  userProfile: UserDto;
  initialValues?: PaymentFormValues;
};
const Step03PaymentConfiguration = ({
  userProfile,
  onSubmit,
  onBack,
  initialValues,
}: Step03PaymentConfigurationProps) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
  } = useForm<PaymentFormValues>();
  const [showBusinessFieldset, setShowBusinessFieldset] = useState(false);
  const selectedPaymentMethod = watch('paymentMethod');
  const t = useTranslations();
  useEffect(() => {
    logStepEntry('03', 'PaymentConfiguration', {
      userId: userProfile.id,
      hasInitialValues: !!initialValues,
    });
  }, [userProfile.id, initialValues]);
  useEffect(() => {
    if (selectedPaymentMethod === 'PowerOfficeEHFInvoice') {
      setShowBusinessFieldset(true);
    } else {
      setShowBusinessFieldset(false);
    }
  }, [selectedPaymentMethod]);
  useEffect(() => {
    if (initialValues) {
      const formKeys = Object.keys(initialValues) as Array<keyof PaymentFormValues>;
      formKeys.forEach(key => {
        setValue(key, initialValues[key]);
      });
    }
  }, [initialValues, setValue]);
  const onSubmitForm: SubmitHandler<PaymentFormValues> = (data: PaymentFormValues) => {
    logStepComplete('03', 'PaymentConfiguration', {
      paymentMethod: data.paymentMethod,
      isBusinessCustomer: data.paymentMethod === 'PowerOfficeEHFInvoice',
    });
    onSubmit(data);
  };
  const handleBack = () => {
    logUserAction('Back from payment configuration');
    onBack?.();
  };
  const formClassName = 'space-y-6';
  const fieldsetClassName = 'space-y-4';
  const fieldsetLegendClassName = 'text-lg font-semibold border-b-2 pb-2 mb-4';
  return (
    <div className="max-w-2xl mx-auto">
      <Heading as="h2" className="mb-6">
        {t('user.registration.steps.payment.title')}
      </Heading>
      <form onSubmit={handleSubmit(onSubmitForm)} className={formClassName}>
        <fieldset className={fieldsetClassName}>
          <legend className={fieldsetLegendClassName}>
            {t('user.registration.customertype.legend')}
          </legend>
          <ul className="flex flex-col gap-3">
            <li className="flex items-center gap-2">
              <input
                type="radio"
                id="emailinvoice"
                value="PowerOfficeEmailInvoice"
                data-testid="registration-emailinvoice-input"
                defaultChecked={true}
                {...register('paymentMethod')}
                className="w-4 h-4"
              />
              <label htmlFor="emailinvoice" className="cursor-pointer">
                {t('user.registration.customertype.private')}
              </label>
            </li>
            <li className="flex items-center gap-2">
              <input
                type="radio"
                id="ehfInvoice"
                data-testid="registration-ehfinvoice-input"
                value="PowerOfficeEHFInvoice"
                {...register('paymentMethod')}
                className="w-4 h-4"
              />
              <label htmlFor="ehfInvoice" className="cursor-pointer">
                {t('user.registration.customertype.business')}
              </label>
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
            testId="registration-zipcode-input"
            placeholder="Zip Code"
            errors={errors}
          />
          <Input
            {...register('city', {
              required: 'City is required',
            })}
            label={t('user.registration.address.city')}
            testId="registration-city-input"
            placeholder="City"
            errors={errors}
          />
          <Input
            {...register('country', {
              required: 'Country is required',
            })}
            label={t('user.registration.address.country')}
            testId="registration-country-input"
            defaultValue="Norway"
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
              testId="registration-vat-input"
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
        <div className="flex gap-4 pt-4">
          {onBack && (
            <Button type="button" onClick={handleBack} variant="outline">
              {t('common.buttons.back')}
            </Button>
          )}
          <Button testId="registration-payment-submit-button" type="submit" variant="primary">
            {t('common.buttons.continue')}
          </Button>
        </div>
      </form>
    </div>
  );
};
export default Step03PaymentConfiguration;

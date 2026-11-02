'use client';
import { useEffect } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { Button } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Fieldset, Form, RadioGroup, TextField } from '@eventuras/ratio-ui/forms';

import { RegistrationPayerType, UserDto } from '@/lib/eventuras-sdk';
import {
  getInitialPaymentFormValues,
  isNorway,
  isOrganizationPayer,
  isValidNorwegianOrganizationNumber,
} from '@/lib/payer';
import { PaymentFormValues } from '@/types';

import { logStepComplete, logStepEntry, logUserAction } from '../../lib/eventFlowLogger';

export type Step03PaymentConfigurationProps = {
  onSubmit: (values: PaymentFormValues) => void;
  onBack?: () => void;
  userProfile: UserDto;
  initialValues?: PaymentFormValues;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Step03PaymentConfiguration = ({
  userProfile,
  onSubmit,
  onBack,
  initialValues,
}: Step03PaymentConfigurationProps) => {
  const t = useTranslations();
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    getValues,
    setValue,
  } = useForm<PaymentFormValues>({
    defaultValues: initialValues ?? getInitialPaymentFormValues(userProfile),
  });

  const payerType = useWatch({ control, name: 'payerType' });
  const isOrganization = isOrganizationPayer(payerType);
  const referenceRequired = payerType === 'OtherOrganization';

  useEffect(() => {
    logStepEntry('03', 'PaymentConfiguration', {
      userId: userProfile.id,
      hasInitialValues: !!initialValues,
    });
  }, [userProfile.id, initialValues]);

  const required = t('user.registration.validation.required');

  const requiredText = (value: string) => value.trim() !== '' || required;

  const requiredForOrganization = (value: string) =>
    !isOrganizationPayer(getValues('payerType')) || requiredText(value);

  const validateOrganizationNumber = (value: string) => {
    if (!isOrganizationPayer(getValues('payerType'))) return true;
    if (value.trim() === '') return required;
    if (isNorway(getValues('country')) && !isValidNorwegianOrganizationNumber(value)) {
      return t('user.registration.validation.organizationNumber');
    }
    return true;
  };

  const validateInvoiceReference = (value: string) =>
    getValues('payerType') !== 'OtherOrganization' || requiredText(value);

  const validateContactEmail = (value: string) => {
    if (!isOrganizationPayer(getValues('payerType'))) return true;
    if (value.trim() === '') return required;
    return emailPattern.test(value.trim()) || t('user.registration.validation.email');
  };

  // "My company" usually means the participant answers for the invoice, so they are
  // prefilled as contact. Another organization needs someone there, so that prefill is cleared.
  const changePayerType = (next: RegistrationPayerType, onChange: (value: string) => void) => {
    onChange(next);
    const ownName = userProfile.name ?? '';
    const ownEmail = userProfile.email ?? '';

    if (next === 'OwnCompany') {
      if (!getValues('contactName')) setValue('contactName', ownName);
      if (!getValues('contactEmail')) setValue('contactEmail', ownEmail);
    } else if (next === 'OtherOrganization') {
      if (getValues('contactName') === ownName) setValue('contactName', '');
      if (getValues('contactEmail') === ownEmail) setValue('contactEmail', '');
    }

    logUserAction('Payer type changed', { payerType: next });
  };

  const onSubmitForm: SubmitHandler<PaymentFormValues> = (data: PaymentFormValues) => {
    logStepComplete('03', 'PaymentConfiguration', { payerType: data.payerType });
    onSubmit({
      ...data,
      username: userProfile.name ?? data.username,
      email: userProfile.email ?? data.email,
      phoneNumber: userProfile.phoneNumber ?? data.phoneNumber,
    });
  };

  const handleBack = () => {
    logUserAction('Back from payment configuration');
    onBack?.();
  };

  return (
    <>
      <Heading as="h2" marginBottom="sm">
        {t('user.registration.steps.payment.title')}
      </Heading>
      <Form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        <Controller
          name="payerType"
          control={control}
          render={({ field }) => (
            <RadioGroup<RegistrationPayerType>
              name={field.name}
              label={t('user.registration.payer.legend')}
              value={field.value}
              onChange={value => changePayerType(value, field.onChange)}
              options={[
                {
                  value: 'Private',
                  label: t('user.registration.payer.private'),
                  description: t('user.registration.payer.privateDescription'),
                },
                {
                  value: 'OwnCompany',
                  label: t('user.registration.payer.ownCompany'),
                  description: t('user.registration.payer.ownCompanyDescription'),
                },
                {
                  value: 'OtherOrganization',
                  label: t('user.registration.payer.otherOrganization'),
                  description: t('user.registration.payer.otherOrganizationDescription'),
                },
              ]}
            />
          )}
        />

        {isOrganization && (
          <Fieldset label={t('user.registration.organization.legend')}>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {t('user.registration.payer.ehfNotice')}
            </p>
            <TextField
              {...register('vatNumber', { validate: validateOrganizationNumber })}
              label={t('user.registration.organization.vatNumber')}
              testId="registration-vat-input"
              inputMode="numeric"
              errors={errors}
            />
            <TextField
              {...register('organizationName', { validate: requiredForOrganization })}
              label={t('user.registration.organization.name')}
              testId="registration-organizationname-input"
              autoComplete="organization"
              errors={errors}
            />
            <TextField
              {...register('invoiceReference', { validate: validateInvoiceReference })}
              label={t('user.registration.organization.invoiceReference')}
              description={
                referenceRequired
                  ? t('user.registration.organization.invoiceReferenceRequired')
                  : t('user.registration.organization.invoiceReferenceOptional')
              }
              testId="registration-invoicereference-input"
              errors={errors}
            />
            <TextField
              {...register('contactName', { validate: requiredForOrganization })}
              label={t('user.registration.organization.contactName')}
              description={t('user.registration.organization.contactDescription')}
              testId="registration-contactname-input"
              errors={errors}
            />
            <TextField
              {...register('contactEmail', { validate: validateContactEmail })}
              label={t('user.registration.organization.contactEmail')}
              type="email"
              testId="registration-contactemail-input"
              errors={errors}
            />
          </Fieldset>
        )}

        <Fieldset
          label={
            isOrganization
              ? t('user.registration.address.invoiceLegend')
              : t('user.registration.address.legend')
          }
        >
          <TextField
            {...register('address', { validate: requiredText })}
            label={t('user.registration.address.street')}
            testId="registration-address-input"
            autoComplete="street-address"
            errors={errors}
          />
          <TextField
            {...register('zip', { validate: requiredText })}
            label={t('user.registration.address.zip')}
            testId="registration-zipcode-input"
            autoComplete="postal-code"
            errors={errors}
          />
          <TextField
            {...register('city', { validate: requiredText })}
            label={t('user.registration.address.city')}
            testId="registration-city-input"
            autoComplete="address-level2"
            errors={errors}
          />
          <TextField
            {...register('country', { validate: requiredText })}
            label={t('user.registration.address.country')}
            testId="registration-country-input"
            autoComplete="country-name"
            errors={errors}
          />
        </Fieldset>

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
      </Form>
    </>
  );
};
export default Step03PaymentConfiguration;

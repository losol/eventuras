'use client';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { EventDto, ProductDto } from '@eventuras/event-sdk';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

import { PaymentFormValues, ProductSelected } from '@/types';

import { logStepComplete, logStepEntry, logUserAction } from '../../lib/eventFlowLogger';
export interface Step04RegistrationConfirmationProps {
  eventInfo: EventDto;
  products: ProductDto[];
  selectedProducts: ProductSelected[];
  paymentDetails: PaymentFormValues;
  onSubmit?: () => void;
  onBack?: () => void;
}
const Step04RegistrationConfirmation: React.FC<Step04RegistrationConfirmationProps> = ({
  onSubmit,
  onBack,
  products,
  selectedProducts,
  paymentDetails,
  eventInfo,
}) => {
  const t = useTranslations();
  useEffect(() => {
    logStepEntry('04', 'RegistrationConfirmation', {
      eventId: eventInfo.id,
      productCount: products.length,
      selectedProductCount: selectedProducts.length,
    });
  }, [eventInfo.id, products.length, selectedProducts.length]);
  const handleSubmit = () => {
    logStepComplete('04', 'RegistrationConfirmation', {
      eventId: eventInfo.id,
    });
    onSubmit?.();
  };
  const handleBack = () => {
    logUserAction('Back from confirmation');
    onBack?.();
  };
  return (
    <div className="max-w-2xl mx-auto">
      <Heading as="h2" className="mb-6">
        {t('user.registration.steps.confirmation.title')}
      </Heading>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        {t('user.registration.steps.confirmation.description')}
      </p>
      {products.length > 0 && (
        <div className="mb-8">
          <Heading as="h3" className="mb-4">
            {t('common.labels.products')}
          </Heading>
          <ul className="space-y-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            {products.map((p: ProductDto) => {
              const mappedProducts = selectedProducts.filter(s => s.productId === p.productId);
              const amountOrdered = mappedProducts.length ? mappedProducts[0]!.quantity : 0;
              if (amountOrdered === 0) return null;
              return (
                <li key={p.productId} className="flex justify-between">
                  <span>{p.name}</span>
                  <span className="font-semibold">x {amountOrdered}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className="mb-8">
        <Heading as="h3" className="mb-4">
          {t('user.registration.labels.paymentDetails')}
        </Heading>
        <dl className="space-y-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">
              {t('user.registration.customertype.legend')}:
            </dt>
            <dd className="font-semibold">
              {paymentDetails.paymentMethod === 'PowerOfficeEmailInvoice'
                ? t('user.registration.customertype.private')
                : t('user.registration.customertype.business')}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">
              {t('user.registration.user.name')}:
            </dt>
            <dd className="font-semibold">{paymentDetails.username}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">
              {t('user.registration.user.email')}:
            </dt>
            <dd className="font-semibold">{paymentDetails.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">
              {t('user.registration.user.phoneNumber')}:
            </dt>
            <dd className="font-semibold">{paymentDetails.phoneNumber}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">
              {t('user.registration.address.city')}:
            </dt>
            <dd className="font-semibold">{paymentDetails.city}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">
              {t('user.registration.address.country')}:
            </dt>
            <dd className="font-semibold">{paymentDetails.country}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">
              {t('user.registration.address.zip')}:
            </dt>
            <dd className="font-semibold">{paymentDetails.zip}</dd>
          </div>
          {paymentDetails.paymentMethod === 'PowerOfficeEHFInvoice' && (
            <>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">
                  {t('user.registration.businessinfo.vatNumber')}:
                </dt>
                <dd className="font-semibold">{paymentDetails.vatNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">
                  {t('user.registration.businessinfo.invoiceReference')}:
                </dt>
                <dd className="font-semibold">{paymentDetails.invoiceReference}</dd>
              </div>
            </>
          )}
        </dl>
      </div>
      <div className="flex gap-4">
        {onBack && (
          <Button onClick={handleBack} variant="outline">
            {t('common.buttons.back')}
          </Button>
        )}
        {onSubmit && (
          <Button
            variant="primary"
            onClick={handleSubmit}
            testId="registration-confirmation-button"
          >
            {t('common.labels.confirmRegistration')}
          </Button>
        )}
      </div>
    </div>
  );
};
export default Step04RegistrationConfirmation;

'use client';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

import { EventDto, ProductDto } from '@/lib/eventuras-sdk';
import { isOrganizationPayer } from '@/lib/payer';
import { PaymentFormValues, ProductSelected } from '@/types';

import { logStepComplete, logStepEntry, logUserAction } from '../../lib/eventFlowLogger';
const DetailRow = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-600 dark:text-gray-400">{label}:</dt>
      <dd className="font-semibold text-right">{value}</dd>
    </div>
  ) : null;

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
  const isOrganization = isOrganizationPayer(paymentDetails.payerType);
  const payerLabel = {
    Private: t('user.registration.payer.private'),
    OwnCompany: t('user.registration.payer.ownCompany'),
    OtherOrganization: t('user.registration.payer.otherOrganization'),
  }[paymentDetails.payerType];
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
      <Heading as="h2" marginBottom="sm">
        {t('user.registration.steps.confirmation.title')}
      </Heading>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        {t('user.registration.steps.confirmation.description')}
      </p>
      {products.length > 0 && (
        <div className="mb-8">
          <Heading as="h3" marginBottom="sm">
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
        <Heading as="h3" marginBottom="sm">
          {t('user.registration.labels.paymentDetails')}
        </Heading>
        <dl className="space-y-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <DetailRow label={t('user.registration.labels.payer')} value={payerLabel} />
          {isOrganization ? (
            <>
              <DetailRow
                label={t('user.registration.organization.name')}
                value={paymentDetails.organizationName}
              />
              <DetailRow
                label={t('user.registration.organization.vatNumber')}
                value={paymentDetails.vatNumber}
              />
              <DetailRow
                label={t('user.registration.organization.invoiceReference')}
                value={paymentDetails.invoiceReference}
              />
              <DetailRow
                label={t('user.registration.labels.contactPerson')}
                value={[paymentDetails.contactName, paymentDetails.contactEmail]
                  .filter(Boolean)
                  .join(', ')}
              />
            </>
          ) : (
            <>
              <DetailRow label={t('user.registration.user.name')} value={paymentDetails.username} />
              <DetailRow label={t('user.registration.user.email')} value={paymentDetails.email} />
              <DetailRow
                label={t('user.registration.user.phoneNumber')}
                value={paymentDetails.phoneNumber}
              />
            </>
          )}
          <DetailRow
            label={
              isOrganization
                ? t('user.registration.address.invoiceLegend')
                : t('user.registration.address.legend')
            }
            value={[
              paymentDetails.address,
              [paymentDetails.zip, paymentDetails.city].filter(Boolean).join(' '),
              paymentDetails.country,
            ]
              .filter(Boolean)
              .join(', ')}
          />
        </dl>
        {isOrganization && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('user.registration.payer.ehfNotice')}
          </p>
        )}
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

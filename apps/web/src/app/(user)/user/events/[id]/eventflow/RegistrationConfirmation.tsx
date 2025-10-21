import { EventDto, ProductDto } from '@eventuras/event-sdk';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

;
;
;
import { useTranslations } from 'next-intl';
import { PaymentFormValues, ProductSelected } from '@/types';
export interface RegistrationConfirmationProps {
  eventInfo: EventDto;
  products: ProductDto[];
  selectedProducts: ProductSelected[];
  paymentDetails: PaymentFormValues;
  onSubmit?: () => void;
  onBack?: () => void;
}
const RegistrationConfirmation: React.FC<RegistrationConfirmationProps> = ({
  onSubmit,
  onBack,
  products,
  selectedProducts,
  paymentDetails,
}) => {
  const t = useTranslations();
  return (
    <div>
      <p>{t('user.registration.steps.confirmation.description')}</p>
      {products.length > 0 && (
        <>
          <Heading as="h2">{t('common.labels.products')}</Heading>
          <ul>
            {products.map((p: ProductDto) => {
              const mappedProducts = selectedProducts.filter(s => s.productId === p.productId);
              const amountOrdered = mappedProducts.length ? mappedProducts[0]!.quantity : 0;
              return <li key={p.productId}>{`${p.name} x ${amountOrdered}`}</li>;
            })}
          </ul>
        </>
      )}
      <Heading as="h2">{t('user.registration.labels.paymentDetails')}</Heading>
      <ul className="py-6">
        <li>{`${t('user.registration.customertype.legend')}:${paymentDetails.paymentMethod === 'PowerOfficeEmailInvoice' ? t('user.registration.customertype.private') : t('user.registration.customertype.business')}`}</li>
        <li>{`${t('user.registration.user.name')}:${paymentDetails.username}`}</li>
        <li>{`${t('user.registration.user.email')}:${paymentDetails.email}`}</li>
        <li>{`${t('user.registration.user.phoneNumber')}:${paymentDetails.phoneNumber}`}</li>
        <li>{`${t('user.registration.address.city')}:${paymentDetails.city}`}</li>
        <li>{`${t('user.registration.address.country')}:${paymentDetails.country}`}</li>
        <li>{`${t('user.registration.address.zip')}:${paymentDetails.zip}`}</li>
        {paymentDetails.paymentMethod === 'PowerOfficeEHFInvoice' && (
          <>
            <li>{`${t('user.registration.businessinfo.vatNumber')}:${paymentDetails.vatNumber}`}</li>
            <li>{`${t('user.registration.businessinfo.invoiceReference')}:${paymentDetails.invoiceReference}`}</li>
          </>
        )}
      </ul>
      <div>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            {t('common.buttons.back')}
          </Button>
        )}
        {onSubmit && (
          <Button
            variant="primary"
            onClick={onSubmit}
            testId="registration-confirmation-button"
          >
            {t('common.labels.confirmRegistration')}
          </Button>
        )}
      </div>
    </div>
  );
};
export default RegistrationConfirmation;
import { PaymentProvider, ProductDto } from '@losol/eventuras';
import { EventDto } from '@losol/eventuras/dist/models/EventDto';
import createTranslation from 'next-translate/createTranslation';

import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
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
  eventInfo,
  onSubmit,
  onBack,
  products,
  selectedProducts,
  paymentDetails,
}) => {
  const { t } = createTranslation();
  return (
    <div>
      <p>
        You are about to confirm the registration, please double check details below before
        submitting.
      </p>
      <Text text={eventInfo.title} className="py-3" />
      <Heading as="h2">Products selected</Heading>
      <ul>
        {products.map((p: ProductDto) => {
          const mappedProducts = selectedProducts.filter(s => s.productId === p.productId);
          const amountOrdered = mappedProducts.length ? mappedProducts[0].quantity : 0;
          return <li key={p.productId}>{`${p.name} amount ordered: ${amountOrdered}`}</li>;
        })}
      </ul>
      <Heading as="h2">Payment Information</Heading>
      <ul>
        <li>{`${t('user:registration.customertype.legend')}:${paymentDetails.paymentMethod === PaymentProvider.EMAIL_INVOICE ? t('user:registration.customertype.private') : t('user:registration.customertype.business')}`}</li>
        <li>{`${t('user:registration.user.name')}:${paymentDetails.username}`}</li>
        <li>{`${t('user:registration.user.email')}:${paymentDetails.email}`}</li>
        <li>{`${t('user:registration.user.phoneNumber')}:${paymentDetails.phoneNumber}`}</li>
        <li>{`${t('user:registration.address.city')}:${paymentDetails.city}`}</li>
        <li>{`${t('user:registration.address.country')}:${paymentDetails.country}`}</li>
        <li>{`${t('user:registration.address.zip')}:${paymentDetails.zip}`}</li>
        {paymentDetails.paymentMethod === PaymentProvider.POWER_OFFICE_EHFINVOICE && (
          <>
            <li>{`${t('user:registration.businessinfo.vatNumber')}:${paymentDetails.vatNumber}`}</li>
            <li>{`${t('user:registration.businessinfo.invoiceReference')}:${paymentDetails.invoiceReference}`}</li>
          </>
        )}
      </ul>

      <div>
        {onBack && <Button onClick={onBack}>{t('common:buttons.back')}</Button>}
        {onSubmit && <Button onClick={onSubmit}>{t('common:buttons.submit')}</Button>}
      </div>
    </div>
  );
};

export default RegistrationConfirmation;

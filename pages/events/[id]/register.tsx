import { NewRegistrationDto, ProductDto, RegistrationsService } from '@losol/eventuras';
import RegistrationComplete from 'components/event/register-steps/RegistrationComplete';
import RegistrationCustomize, {
  RegistrationProduct,
} from 'components/event/register-steps/RegistrationCustomize';
import RegistrationPayment, {
  RegistrationSubmitValues,
} from 'components/event/register-steps/RegistrationPayment';
import useEventProducts from 'hooks/useEventProducts';
import useMyUserProfile from 'hooks/useMyUserProfile';
import { useRouter } from 'next/router';
import { useState } from 'react';

type PageStep = 'Customize' | 'Payment' | 'Complete';

const mapRegistrationProductsToView = (eventProducts: ProductDto[]): RegistrationProduct[] =>
  eventProducts.map((product: ProductDto) => {
    return {
      id: product.productId,
      title: product.name,
      description: product.description,
      mandatory: product.isMandatory,
    } as RegistrationProduct;
  });

const EventRegistration = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<PageStep>('Customize');
  const eventId = parseInt(router.query.id as string, 10);
  const { userProfile, loading: loadingUser } = useMyUserProfile();
  const { registrationProducts, loading: loadingRegistrationProducts } = useEventProducts(eventId);

  const onCustomize = (selectedProductIds: string[]) => {
    console.log({ selectedProductIds });
    setCurrentStep('Payment');
  };

  const onPayment = async ({ paymentDetails, paymentOption }: RegistrationSubmitValues) => {
    console.log({ paymentOption });
    if (paymentDetails) {
      //company invoice
      console.log({ paymentDetails });
    } else {
      //no payment details, so customer is paying
    }
    const requestBody: NewRegistrationDto = {
      userId: userProfile.id,
      eventId,
    };
    await RegistrationsService.postV3Registrations({ requestBody });
    setCurrentStep('Complete');
  };

  const onCompleteFlow = () => {
    console.log('done');
    router.push('/');
  };

  if (loadingRegistrationProducts || loadingUser) return 'LOADING';

  const renderStep = (step: PageStep) => {
    switch (step) {
      case 'Customize':
        return (
          <RegistrationCustomize
            products={mapRegistrationProductsToView(registrationProducts)}
            onSubmit={onCustomize}
          />
        );
      case 'Payment':
        return <RegistrationPayment onSubmit={onPayment} />;
      case 'Complete':
        return <RegistrationComplete onSubmit={onCompleteFlow} />;
    }
  };

  return <>{renderStep(currentStep)}</>;
};

export default EventRegistration;

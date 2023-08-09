import { NewRegistrationDto, RegistrationsService } from '@losol/eventuras';
import RegistrationComplete from 'components/event/register-steps/RegistrationComplete';
import RegistrationCustomize from 'components/event/register-steps/RegistrationCustomize';
import RegistrationPayment, {
    RegistrationSubmitValues,
} from 'components/event/register-steps/RegistrationPayment';
import { Loading } from 'components/feedback';
import { Layout } from 'components/layout';
import { mapEventProductsToView } from 'helpers/modelviewMappers';
import useEvent from 'hooks/useEvent';
import useEventProducts from 'hooks/useEventProducts';
import useMyUserProfile from 'hooks/useMyUserProfile';
import { useRouter } from 'next/router';
import { useState } from 'react';


type PageStep = 'Customize' | 'Payment' | 'Complete';

const EventRegistration = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<PageStep>('Customize');
  const eventId = parseInt(router.query.id as string, 10);
  const { userProfile, loading: loadingUser } = useMyUserProfile();
  const {event,loading:loadingEvent} = useEvent(eventId)
  const { registrationProducts, loading: loadingRegistrationProducts } = useEventProducts(eventId);


  const onCustomize = (selectedProducts:Map<string,number>) => {
    console.log({ selectedProducts });
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

  const renderCustomization = () => {
    if(registrationProducts.length===0){
      return <>
        <p>Registration for <em>{event?.title}</em>. Would you like to register?</p>
        <button onClick={()=>{onCustomize(new Map())}}>Yes</button>
        <button onClick={()=>{router.push('/')}}>No</button>
      </>
    }
    return (
      <RegistrationCustomize
        products={mapEventProductsToView(registrationProducts)}
        onSubmit={onCustomize}
      />
    );
  };

  if (loadingRegistrationProducts || loadingUser || loadingEvent) return <Loading/>

  const renderStep = (step: PageStep) => {
    switch (step) {
      case 'Customize':
        return renderCustomization();
      case 'Payment':
        return <RegistrationPayment onSubmit={onPayment} />;
      case 'Complete':
        return <RegistrationComplete onSubmit={onCompleteFlow} />;
    }
  };

  return <Layout>
     {renderStep(currentStep)}
  </Layout>
};

export default EventRegistration;

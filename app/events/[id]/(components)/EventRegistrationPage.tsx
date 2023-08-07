'use client';

import { NewRegistrationDto, RegistrationsService } from '@losol/eventuras';
import RegistrationComplete from 'components/event/register-steps/RegistrationComplete';
import RegistrationCustomize from 'components/event/register-steps/RegistrationCustomize';
import { RegistrationProduct } from 'components/event/register-steps/RegistrationCustomize';
import RegistrationPayment, {
  RegistrationSubmitValues,
} from 'components/event/register-steps/RegistrationPayment';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type PageStep = 'Customize' | 'Payment' | 'Complete';

type EventRegistrationPageProps = {
  eventId: number;
  products: RegistrationProduct[];
  userProfile: any;
};

const EventRegistrationPage = ({ eventId, products, userProfile }: EventRegistrationPageProps) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<PageStep>('Customize');

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

  const onComplete = () => {
    console.log('done');
    router.push('/');
  };

  const renderStep = (step: PageStep) => {
    switch (step) {
      case 'Customize':
        return <RegistrationCustomize products={products} onSubmit={onCustomize} />;
      case 'Payment':
        return <RegistrationPayment onSubmit={onPayment} />;
      case 'Complete':
        return <RegistrationComplete onSubmit={onComplete} />;
    }
  };

  return <>{renderStep(currentStep)}</>;
};

export default EventRegistrationPage;

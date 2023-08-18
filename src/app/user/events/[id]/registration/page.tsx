'use client';
import { useRouter } from 'next/navigation';
import { MutableRefObject, useContext, useRef, useState } from 'react';

import { Loading } from '@/components/feedback';
import { Layout } from '@/components/layout';
import { UserContext } from '@/context';
import useEventProducts from '@/hooks/useEventProducts';
import PaymentFormValues from '@/types/PaymentFormValues';
import { UserProfile } from '@/types/UserProfile';
import { createEventRegistration } from '@/utils/api/functions/events';
import { mapEventProductsToView, mapToNewRegistration } from '@/utils/api/mappers';

import RegistrationComplete from './components/RegistrationComplete';
import RegistrationCustomize from './components/RegistrationCustomize';
import RegistrationPayment from './components/RegistrationPayment';

type PageStep = 'Customize' | 'Payment' | 'Complete' | 'Error';

const throwUserNotFoundError = () => {
  throw new Error(
    'event/register: User profile is not supposed to be null when registring for an event'
  );
};

type ErrorCause = {
  statusCode: string | number;
  statusText: string;
};

const UserEventRegistration = ({ params }: { params: any }) => {
  const { userState } = useContext(UserContext);
  const userProfile: UserProfile = userState.profile as UserProfile;
  const selectedProducts: MutableRefObject<Map<string, number>> = useRef(new Map());
  const router = useRouter();
  const [loadingEventRegistration, setLoadingEventRegistration] = useState(false);
  const [registrationError, setRegistrationError] = useState<Error | undefined>(undefined);
  const [currentStep, setCurrentStep] = useState<PageStep>('Customize');
  const eventId = parseInt(params.id as string, 10);
  const { registrationProducts, loading: loadingRegistrationProducts } = useEventProducts(eventId);
  const onCustomize = (selected: Map<string, number>) => {
    console.log({ selected });
    selectedProducts.current = selected;
    setCurrentStep('Payment');
  };

  const onPayment = async (formValues: PaymentFormValues) => {
    setLoadingEventRegistration(true);
    console.log(formValues);
    if (!userProfile) {
      throwUserNotFoundError();
      return;
    }

    const result = await createEventRegistration(
      mapToNewRegistration(userProfile.id, eventId, formValues),
      selectedProducts.current
    );
    setLoadingEventRegistration(false);
    console.log({ result });
    if (!result.ok) {
      //TODO unhappy flow

      setRegistrationError(result.error);
      setCurrentStep('Error');
      return;
    }
    setCurrentStep('Complete');
  };

  const onCompleteFlow = () => {
    console.log('done');
    router.push('/');
  };

  if (loadingRegistrationProducts || loadingEventRegistration) return <Loading />;
  if (!userProfile) {
    throwUserNotFoundError();
    return;
  }
  if (currentStep === 'Customize' && registrationProducts.length === 0) {
    //no need to customize order when there are no options, let's go straight to payment
    setCurrentStep('Payment');
  }

  let errCause: ErrorCause | null = null;
  if (registrationError) {
    errCause = registrationError.cause as ErrorCause;
  }

  const renderStep = (step: PageStep) => {
    switch (step) {
      case 'Customize':
        return (
          <RegistrationCustomize
            products={mapEventProductsToView(registrationProducts)}
            onSubmit={onCustomize}
          />
        );
      case 'Payment':
        return <RegistrationPayment onSubmit={onPayment} userProfile={userProfile} />;
      case 'Complete':
        return <RegistrationComplete onSubmit={onCompleteFlow} />;
      case 'Error':
        return (
          <>
            <p>OOps, something went wrong </p>
            <p>{errCause?.statusCode}</p>
            <textarea defaultValue={errCause?.statusText} />
          </>
        );
    }
  };

  return <Layout>{renderStep(currentStep)}</Layout>;
};

export default UserEventRegistration;

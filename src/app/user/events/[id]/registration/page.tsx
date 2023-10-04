'use client';
import { useRouter } from 'next/navigation';
import { MutableRefObject, useContext, useRef, useState } from 'react';

import { Layout } from '@/components/ui';
import FatalError from '@/components/ui/FatalError';
import Loading from '@/components/ui/Loading';
import { UserContext } from '@/context';
import { useEventProducts } from '@/hooks/apiHooks';
import PaymentFormValues from '@/types/PaymentFormValues';
import { UserProfile } from '@/types/UserProfile';
import { ApiError } from '@/utils/api';
import { createEventRegistration } from '@/utils/api/functions/events';
import { mapEventProductsToView, mapToNewRegistration } from '@/utils/api/mappers';
import Logger from '@/utils/Logger';

import RegistrationComplete from './components/RegistrationComplete';
import RegistrationCustomize from './components/RegistrationCustomize';
import RegistrationPayment from './components/RegistrationPayment';

type PageStep = 'Customize' | 'Payment' | 'Complete' | 'Error';

const throwUserNotFoundError = () => {
  throw new Error(
    'event/register: User profile is not supposed to be null when registring for an event'
  );
};
const l = { namespace: 'events:registration' };
const UserEventRegistration = ({ params }: { params: any }) => {
  const { userState } = useContext(UserContext);
  const userProfile: UserProfile = userState.profile as UserProfile;
  const selectedProducts: MutableRefObject<Map<string, number>> = useRef(new Map());
  const router = useRouter();
  const [loadingEventRegistration, setLoadingEventRegistration] = useState(false);
  const [registrationError, setRegistrationError] = useState<ApiError | undefined>(undefined);
  const [currentStep, setCurrentStep] = useState<PageStep>('Customize');
  const eventId = parseInt(params.id as string, 10);
  const { registrationProducts, loading: loadingRegistrationProducts } = useEventProducts(eventId);
  const onCustomize = (selected: Map<string, number>) => {
    Logger.info(l, { selected });
    selectedProducts.current = selected;
    setCurrentStep('Payment');
  };

  const onPayment = async (formValues: PaymentFormValues) => {
    setLoadingEventRegistration(true);
    Logger.info(l, formValues);
    if (!userProfile) {
      throwUserNotFoundError();
      return;
    }

    const result = await createEventRegistration(
      mapToNewRegistration(userProfile.id, eventId, formValues),
      selectedProducts.current
    );
    setLoadingEventRegistration(false);
    Logger.info(l, { result });
    if (!result.ok) {
      //TODO unhappy flow

      setRegistrationError(result.error);
      setCurrentStep('Error');
      return;
    }
    setCurrentStep('Complete');
  };

  const onCompleteFlow = () => {
    Logger.info(l, 'done');
    router.push('/');
  };

  if (loadingRegistrationProducts || loadingEventRegistration) return <Loading />;
  if (!userProfile) {
    return null;
  }
  if (currentStep === 'Customize' && registrationProducts.length === 0) {
    //no need to customize order when there are no options, let's go straight to payment
    setCurrentStep('Payment');
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
        let title = 'Server issue';
        let description = `Something has gone wrong, please try again later ${registrationError?.statusCode} : ${registrationError?.statusText}`;
        if (registrationError?.statusCode === 409) {
          title = 'Oops';
          description = 'Seems you already registered for this event';
        }
        return <FatalError title={title} description={description} />;
    }
  };

  return <Layout>{renderStep(currentStep)}</Layout>;
};

export default UserEventRegistration;

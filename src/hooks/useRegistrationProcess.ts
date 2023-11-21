'use client';

import { ApiError, EventDto, UserDto } from '@losol/eventuras';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import PaymentFormValues from '@/types/PaymentFormValues';
import { createEventRegistration } from '@/utils/api/functions/events';
import { mapToNewRegistration } from '@/utils/api/mappers';
import Logger from '@/utils/Logger';

type PageStep = 'Customize' | 'Payment' | 'Complete' | 'Error' | 'Loading';

export const useRegistrationProcess = (eventInfo: EventDto, userProfile: UserDto) => {
  const selectedProducts = useRef(new Map<string, number>());
  const router = useRouter();
  const [currentStep, setCurrentStepInternal] = useState<PageStep>('Customize');
  const [loadingEventRegistration, setLoadingEventRegistration] = useState(false);
  const [registrationError, setRegistrationError] = useState<ApiError | undefined>();
  const loggerNamespace = { namespace: 'useRegistrationProcess' };

  const onCustomize = (selected: Map<string, number>) => {
    Logger.info(loggerNamespace, 'Customize event products', { selected });
    selectedProducts.current = selected;
    setCurrentStepInternal('Payment');
  };

  const onPayment = async (formValues: PaymentFormValues) => {
    setLoadingEventRegistration(true);
    Logger.info(loggerNamespace, 'Processing payment', formValues);

    const newRegistrationData = mapToNewRegistration(userProfile.id!, eventInfo.id!, formValues);

    const result = await createEventRegistration(newRegistrationData, selectedProducts.current);

    setLoadingEventRegistration(false);
    if (!result.ok) {
      Logger.error(loggerNamespace, 'Registration error', result.error);
      setRegistrationError(result.error!);
      setCurrentStepInternal('Error');
      return;
    }

    Logger.info(loggerNamespace, 'Registration complete', { result });
    setCurrentStepInternal('Complete');
  };

  const onCompleteFlow = () => {
    Logger.info(loggerNamespace, 'Completed registration flow');
    router.push('/');
  };

  return {
    currentStep,
    registrationError,
    onCustomize,
    onPayment,
    onCompleteFlow,
    loadingEventRegistration,
  };
};

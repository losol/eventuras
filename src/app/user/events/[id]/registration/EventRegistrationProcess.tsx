'use client';

import { EventDto, ProductDto, UserDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';
import React from 'react';

import FatalError from '@/components/ui/FatalError';
import Loading from '@/components/ui/Loading';
import { useRegistrationProcess } from '@/hooks/useRegistrationProcess';

import RegistrationComplete from './RegistrationComplete';
import RegistrationCustomize from './RegistrationCustomize';
import RegistrationPayment from './RegistrationPayment';

interface UserEventRegistrationProps {
  eventInfo: EventDto;
  user: UserDto;
  products: ProductDto[];
}

const EventRegistrationProcess: React.FC<UserEventRegistrationProps> = ({
  eventInfo,
  user,
  products,
}) => {
  const { currentStep, registrationError, onCustomize, onPayment, onCompleteFlow } =
    useRegistrationProcess(eventInfo, user);
  const { t } = createTranslation();

  const renderStep = () => {
    switch (currentStep) {
      case 'Customize':
        return <RegistrationCustomize products={products} onSubmit={onCustomize} />;
      case 'Payment':
        return <RegistrationPayment userProfile={user} onSubmit={onPayment} />;
      case 'Complete':
        return <RegistrationComplete onSubmit={onCompleteFlow} />;
      case 'Error':
        return (
          <FatalError
            title={t('common:errorpage.title')}
            description={registrationError?.message || t('common:errorpage.description')}
          />
        );
      default:
        return <Loading />;
    }
  };

  return renderStep();
};

export default EventRegistrationProcess;

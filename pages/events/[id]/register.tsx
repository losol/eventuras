import RegistrationCustomize, {
  RegistrationProduct,
} from 'components/event/register-steps/RegistrationCustomize';
import { useState } from 'react';

import RegistrationComplete from '../../../components/event/register-steps/RegistrationComplete';
import RegistrationPayment, {
  RegistrationSubmitValues,
} from '../../../components/event/register-steps/RegistrationPayment';

//TODO grab from API
const testProducts: RegistrationProduct[] = [
  {
    id: 'hello1',
    title: 'Hello 1',
    description:
      'This is a test for a mandatory item - these will have to come form the api (next step)',
    mandatory: true,
  },
  {
    id: 'hello2',
    title: 'Hello 2',
    description: 'This is a test for a optional item - Product item 2',
    mandatory: false,
  },
  {
    id: 'hello3',
    title: 'Another Test',
    description: 'This is a test for a optional item - Product item 3',
    mandatory: false,
  },
];

type PageStep = 'Customize' | 'Payment' | 'Complete';

const EventRegistration = () => {
  const [currentStep, setCurrentStep] = useState<PageStep>('Customize');
  const onCustomize = (selected: string[]) => {
    console.log(selected);
    setCurrentStep('Payment');
  };

  const onPayment = ({ paymentDetails }: RegistrationSubmitValues) => {
    if (paymentDetails) {
      //company invoice
      console.log(paymentDetails);
    } else {
      //customer is paying
    }
    setCurrentStep('Complete');
  };

  const onComplete = () => {
    console.log('done');
  };

  const renderStep = (step: PageStep) => {
    switch (step) {
      case 'Customize':
        return <RegistrationCustomize products={testProducts} onSubmit={onCustomize} />;
      case 'Payment':
        return <RegistrationPayment onSubmit={onPayment} />;
      case 'Complete':
        return <RegistrationComplete onSubmit={onComplete} />;
    }
  };

  return <>{renderStep(currentStep)}</>;
};

export default EventRegistration;

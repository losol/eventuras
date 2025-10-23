'use client';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Loading } from '@eventuras/ratio-ui/core/Loading';
import type { Step } from '@eventuras/ratio-ui/core/Stepper';
import { Stepper } from '@eventuras/ratio-ui/core/Stepper';
import { useToast } from '@eventuras/toast';

import FatalError from '@/components/FatalError';
import { EventDto, ProductDto, UserDto } from "@/lib/eventuras-sdk";
import { PaymentFormValues, ProductSelected } from '@/types';
import { SiteInfo } from '@/utils/site/getSiteSettings';

import Step01AccountValidation from './steps/01_AccountValidation';
import Step02ProductCustomization from './steps/02_ProductCustomization';
import Step03PaymentConfiguration from './steps/03_PaymentConfiguration';
import Step04RegistrationConfirmation from './steps/04_RegistrationConfirmation';
import Step05RegistrationView from './steps/05_RegistrationView';
import Step06RegistrationCancellation from './steps/06_RegistrationCancellation';
import { useEventFlowMachine } from '../hooks/useEventFlowMachine';
import { eventFlowLogger } from '../lib/eventFlowLogger';
export interface EventFlowContainerProps {
  eventInfo: EventDto;
  user: UserDto;
  availableProducts: ProductDto[];
  siteInfo: SiteInfo;
}
const EventFlowContainer: React.FC<EventFlowContainerProps> = ({
  eventInfo,
  user,
  availableProducts,
  siteInfo,
}) => {
  const t = useTranslations();
  const toast = useToast();
  const {
    state: xState,
    send,
    context,
    isLoading,
    isError,
    States,
    Events,
  } = useEventFlowMachine({ eventInfo, user, availableProducts });
  const inEditMode = context.inEditMode;
  // Helper to get selected products
  const getSelectedProducts = (): ProductSelected[] => {
    const stateSelected = context.selectedProducts;
    if (stateSelected) {
      return [...stateSelected.keys()].map((key: string) => ({
        productId: parseInt(key, 10),
        quantity: stateSelected.get(key),
      }));
    }
    if (inEditMode) {
      return context?.registrations[0]?.products ?? [];
    }
    return [];
  };
  // Get current step number for stepper component
  const getCurrentStepInfo = (): { currentStep: number; steps: Step[] } => {
    const baseSteps: Step[] = [
      { number: 1, label: t('user.registration.steps.account.label'), status: 'upcoming' },
      { number: 2, label: t('user.registration.steps.products.label'), status: 'upcoming' },
      { number: 3, label: t('user.registration.steps.payment.label'), status: 'upcoming' },
      { number: 4, label: t('user.registration.steps.confirmation.label'), status: 'upcoming' },
    ];
    let currentStep = 0;
    // Map states to step numbers
    if (xState.matches(States.VALIDATE_ACCOUNT_DETAILS)) {
      currentStep = 1;
    } else if (xState.matches(States.CUSTOMIZE_PRODUCTS)) {
      currentStep = 2;
    } else if (xState.matches(States.CONFIGURE_PAYMENT)) {
      currentStep = 3;
    } else if (xState.matches(States.CONFIRM_REGISTRATION)) {
      currentStep = 4;
    }
    // Mark completed steps
    const steps = baseSteps.map((step, index) => ({
      ...step,
      status: (index + 1 < currentStep
        ? 'complete'
        : index + 1 === currentStep
          ? 'current'
          : 'upcoming') as Step['status'],
    }));
    return { currentStep, steps };
  };
  const stepInfo = getCurrentStepInfo();
  const showStepper = stepInfo.currentStep > 0 && !isLoading && !isError;
  // Show error toast when state machine enters error state
  useEffect(() => {
    if (isError && context.error) {
      eventFlowLogger.error({ error: context.error }, 'Event flow entered error state');
      toast.error(t('common.errors.fatalError.description'));
    }
  }, [isError, context.error, toast, t]);
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loading />
        <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.labels.loading')}</p>
      </div>
    );
  }
  // Render error state
  if (isError) {
    return (
      <FatalError
        title={t('common.errorpage.title')}
        description={t('common.errorpage.description')}
        siteInfo={siteInfo}
        contactUsLabel={t('common.labels.contactUs')}
        contactUsText={t('common.errorpage.contactUs')}
      />
    );
  }
  return (
    <div className="space-y-8">
      {/* Step indicator - responsive: dots on mobile, numbered on desktop */}
      {showStepper && (
        <div className="mb-8">
          {/* Mobile (< 640px): dots variant without labels */}
          <div className="sm:hidden">
            <Stepper
              steps={stepInfo.steps}
              currentStep={stepInfo.currentStep}
              variant="dots"
              orientation="horizontal"
            />
          </div>
          {/* Desktop (>= 640px): numbered variant with labels */}
          <div className="hidden sm:block">
            <Stepper
              steps={stepInfo.steps}
              currentStep={stepInfo.currentStep}
              variant="numbered"
              orientation="horizontal"
            />
          </div>
        </div>
      )}
      {/* Step content */}
      <div>
        {xState.matches(States.SHOW_CANCELLATION_VIEW) && (
          <Step06RegistrationCancellation
            siteInfo={siteInfo}
            onBack={() => {
              send({ type: Events.ON_STEP_BACK });
            }}
          />
        )}
        {xState.matches(States.VALIDATE_ACCOUNT_DETAILS) && (
          <Step01AccountValidation
            user={user}
            onUserUpdated={(updatedUser: UserDto) => {
              send({
                type: Events.ON_SUBMIT_ACCOUNT_DETAILS,
                user: updatedUser,
              });
            }}
          />
        )}
        {xState.matches(States.SHOW_REGISTRATION_VIEW) && (
          <Step05RegistrationView
            eventInfo={eventInfo}
            registration={context.registrations[0]}
            onEdit={() => {
              send({ type: Events.ON_EDIT_REGISTRATION_REQUESTED });
            }}
            onCancel={() => {
              send({ type: Events.ON_CANCEL_REGISTRATION_REQUESTED });
            }}
          />
        )}
        {xState.matches(States.CUSTOMIZE_PRODUCTS) && (
          <Step02ProductCustomization
            products={availableProducts}
            selectedProducts={getSelectedProducts()}
            onBack={() => {
              send({ type: Events.ON_STEP_BACK });
            }}
            onSubmit={(selected: Map<string, number>) => {
              send({
                type: Events.ON_SUBMIT_PRODUCT_SELECTION,
                selectedProducts: selected,
              });
            }}
          />
        )}
        {xState.matches(States.CONFIGURE_PAYMENT) && (
          <Step03PaymentConfiguration
            initialValues={context.paymentFormValues}
            userProfile={user}
            onBack={() => {
              send({ type: Events.ON_STEP_BACK });
            }}
            onSubmit={(formValues: PaymentFormValues) => {
              send({
                type: Events.ON_SUBMIT_PAYMENT_DETAILS,
                formValues,
              });
            }}
          />
        )}
        {xState.matches(States.CONFIRM_REGISTRATION) && (
          <Step04RegistrationConfirmation
            eventInfo={eventInfo}
            products={availableProducts}
            selectedProducts={getSelectedProducts()}
            paymentDetails={context.paymentFormValues}
            onBack={() => {
              send({ type: Events.ON_STEP_BACK });
            }}
            onSubmit={() => {
              send({
                type: Events.ON_CONFIRM_REGISTRATION,
              });
            }}
          />
        )}
      </div>
    </div>
  );
};
export default EventFlowContainer;

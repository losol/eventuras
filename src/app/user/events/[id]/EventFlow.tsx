'use client';

import { EventDto, ProductDto, UserDto } from '@losol/eventuras';
import { useActor } from '@xstate/react';
import { useRouter } from 'next/navigation';
import createTranslation from 'next-translate/createTranslation';

import UserEditor from '@/app/admin/users/UserEditor';
import FatalError from '@/components/ui/FatalError';
import Loading from '@/components/ui/Loading';
import EventFlowMachine, { Events, States } from '@/statemachines/EventFlowMachine';
import { PaymentFormValues, ProductSelected } from '@/types';
import { SiteInfo } from '@/utils/site/getSiteSettings';

import RegistrationCancellation from './eventflow/RegistrationCancellation';
import RegistrationComplete from './eventflow/RegistrationComplete';
import RegistrationConfirmation from './eventflow/RegistrationConfirmation';
import RegistrationCustomize from './eventflow/RegistrationCustomize';
import RegistrationPayment from './eventflow/RegistrationPayment';
import RegistrationView from './eventflow/RegistrationView';

export interface EventFlowProps {
  eventInfo: EventDto;
  user: UserDto;
  availableProducts: ProductDto[];
  siteInfo: SiteInfo;
}

const EventFlow: React.FC<EventFlowProps> = ({ eventInfo, user, availableProducts, siteInfo }) => {
  const { t } = createTranslation();
  const router = useRouter();

  const [xState, send] = useActor(EventFlowMachine, {
    input: {
      eventInfo,
      user,
      availableProducts,
    },
  });
  const inEditMode = xState.context.inEditMode;
  const getSelectedProducts = (): ProductSelected[] => {
    const stateSelected = xState.context.selectedProducts;
    if (stateSelected) {
      return [...stateSelected.keys()].map((key: string) => ({
        productId: parseInt(key, 10),
        quantity: stateSelected.get(key),
      }));
    }
    if (inEditMode) {
      return xState.context.registrations[0].products ?? [];
    }
    return [];
  };
  switch (true) {
    case xState.matches(States.SHOW_CANCELLATION_VIEW):
      return (
        <RegistrationCancellation
          onBack={() => {
            send({ type: Events.ON_STEP_BACK });
          }}
        />
      );
    case xState.matches(States.VALIDATE_ACCOUNT_DETAILS):
      return (
        <UserEditor
          user={user}
          onUserUpdated={(updatedUser: UserDto) => {
            send({
              type: Events.ON_SUBMIT_ACCOUNT_DETAILS,
              user: updatedUser,
            });
          }}
          dataTestId="registration-account-step"
        />
      );
    case xState.matches(States.SHOW_REGISTRATION_VIEW):
      return (
        <RegistrationView
          eventInfo={eventInfo}
          onEdit={() => {
            send({ type: Events.ON_EDIT_REGISTRATION_REQUESTED });
          }}
          onCancel={() => {
            send({ type: Events.ON_CANCEL_REGISTRATION_REQUESTED });
          }}
        />
      );
    case xState.matches(States.CUSTOMIZE_PRODUCTS):
      return (
        <RegistrationCustomize
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
      );
    case xState.matches(States.CONFIGURE_PAYMENT):
      return (
        <RegistrationPayment
          initialValues={xState.context.paymentFormValues}
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
      );
    case xState.matches(States.CONFIRM_REGISTRATION):
      return (
        <RegistrationConfirmation
          eventInfo={eventInfo}
          products={availableProducts}
          selectedProducts={getSelectedProducts()}
          paymentDetails={xState.context.paymentFormValues}
          onBack={() => {
            send({ type: Events.ON_STEP_BACK });
          }}
          onSubmit={() => {
            send({
              type: Events.ON_CONFIRM_REGISTRATION,
            });
          }}
        />
      );
    case xState.matches(States.SUBMITTING):
      return <Loading />;
    case xState.matches(States.COMPLETED):
      return (
        <RegistrationComplete
          onSubmit={() => {
            router.push(`/user`);
          }}
        />
      );
    case xState.matches('error'):
      return (
        <FatalError
          title={t('common:errorpage.title')}
          description={t('common:errorpage.description')}
          siteInfo={siteInfo}
        />
      );
    default:
      return <Loading />;
  }
};

export default EventFlow;

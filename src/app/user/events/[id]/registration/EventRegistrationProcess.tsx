'use client';

import { EventDto, ProductDto, UserDto } from '@losol/eventuras';
import { useActor } from '@xstate/react';
import { useRouter } from 'next/navigation';
import createTranslation from 'next-translate/createTranslation';
import React from 'react';

import AccountEditor from '@/app/user/account/AccountEditor';
import FatalError from '@/components/ui/FatalError';
import Loading from '@/components/ui/Loading';
import EventRegistrationMachine, { Events, States } from '@/statemachines/EventRegistrationMachine';
import PaymentFormValues from '@/types/PaymentFormValues';

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
  const [xState, send] = useActor(EventRegistrationMachine, {
    input: {
      eventInfo,
      user,
      availableProducts: products,
      selectedProducts: new Map<string, number>(),
      paymentFormValues: null,
    },
  });
  const { t } = createTranslation();
  const router = useRouter();

  switch (true) {
    case xState.matches(States.CUSTOMIZE_PRODUCTS):
      return (
        <RegistrationCustomize
          products={products}
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
          userProfile={user}
          onSubmit={(formValues: PaymentFormValues) => {
            send({
              type: Events.ON_SUBMIT_PAYMENT_DETAILS,
              formValues,
            });
          }}
        />
      );
    case xState.matches(States.SUBMITTING):
      return <Loading />;
    case xState.matches(States.ACCOUNT_INFO):
      return (
        <AccountEditor
          user={xState.context.user}
          onUserUpdated={updatedUser => {
            send({
              type: Events.ON_USER_UPDATED,
              user: updatedUser,
            });
          }}
        />
      );
    case xState.matches(States.COMPLETED):
      return (
        <RegistrationComplete
          onSubmit={() => {
            router.push(`/user/events/${eventInfo.id}`);
          }}
        />
      );
    case xState.matches('error'):
      return (
        <FatalError
          title={t('common:errorpage.title')}
          description={t('common:errorpage.description')}
        />
      );
  }
};

export default EventRegistrationProcess;

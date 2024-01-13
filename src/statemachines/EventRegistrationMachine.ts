import { ApiError, EventDto, ProductDto, RegistrationDto, UserDto } from '@losol/eventuras';
import { assign, createMachine, fromPromise } from 'xstate';

import PaymentFormValues from '@/types/PaymentFormValues';
import { createEventRegistration } from '@/utils/api/functions/events';
import { mapToNewRegistration } from '@/utils/api/mappers';

export type EventRegistrationMachineContext = {
  eventInfo: EventDto;
  user: UserDto;
  availableProducts: ProductDto[];
  selectedProducts: Map<string, number>;
  paymentFormValues: PaymentFormValues;
  result: RegistrationDto;
  error: ApiError;
};

export enum States {
  PENDING = 'pending',
  CUSTOMIZE_PRODUCTS = 'customizeProducts',
  CONFIGURE_PAYMENT = 'configurePayment',
  SUBMIT = 'submit',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export enum Events {
  ON_SUBMIT_PRODUCT_SELECTION = 'onSubmitProductSelection',
  ON_SUBMIT_PAYMENT_DETAILS = 'onSubmitPaymentDetails',
}

const EventRegistrationMachine = createMachine({
  id: 'eventRegistration',
  initial: States.PENDING,
  context: init => {
    const input = init.input as EventRegistrationMachineContext;
    return {
      ...input,
    };
  },
  states: {
    [States.PENDING]: {
      description: 'wait for initial context then decide whether to skip product selection page',
      always: [
        {
          guard: ({ context }) => context.availableProducts.length > 0,
          target: States.CUSTOMIZE_PRODUCTS,
        },
        {
          guard: ({ context }) => context.availableProducts.length === 0,
          target: States.CONFIGURE_PAYMENT,
        },
      ],
    },
    [States.CUSTOMIZE_PRODUCTS]: {
      on: {
        [Events.ON_SUBMIT_PRODUCT_SELECTION]: {
          target: States.CONFIGURE_PAYMENT,
          actions: assign({
            selectedProducts: ({ event }) => event.selectedProducts,
          }),
        },
      },
    },
    [States.CONFIGURE_PAYMENT]: {
      on: {
        [Events.ON_SUBMIT_PAYMENT_DETAILS]: {
          target: States.SUBMIT,
          actions: assign({
            paymentFormValues: ({ event }) => event.formValues,
          }),
        },
      },
    },
    [States.SUBMIT]: {
      invoke: {
        id: 'submitEventRegistration',
        src: fromPromise(async ({ input }) => {
          const { user, eventInfo, paymentFormValues, selectedProducts } = input;
          const newRegistrationData = mapToNewRegistration(
            user.id,
            eventInfo.id,
            paymentFormValues
          );
          return createEventRegistration(newRegistrationData, selectedProducts);
        }),
        input: ({ context }) => ({ ...context }),
        onDone: {
          target: States.COMPLETED,
        },
        onError: {
          target: States.ERROR,
        },
      },
    },
    [States.COMPLETED]: {
      type: 'final',
    },
    [States.ERROR]: {
      type: 'final',
    },
  },
});

export default EventRegistrationMachine;

import { ApiError, EventDto, ProductDto, RegistrationDto, UserDto } from '@losol/eventuras';
import { assign, createMachine, fromPromise } from 'xstate';

import { PaymentFormValues } from '@/types';
import { createSDK } from '@/utils/api/EventurasApi';
import { createEventRegistration, updateEventRegistration } from '@/utils/api/functions/events';
import { mapToNewRegistration, mapToUpdatedRegistration } from '@/utils/api/mappers';

export type EventFlowMachineContext = {
  eventInfo: EventDto;
  user: UserDto;
  inEditMode: boolean;
  registrations: RegistrationDto[];
  availableProducts: ProductDto[];
  selectedProducts: Map<string, number>;
  paymentFormValues: PaymentFormValues;
  result: RegistrationDto;
  error: ApiError;
};

export enum States {
  CHECK_REGISTRATION_STATUS = 'checkRegistrationStatus',
  REGISTER_OR_EDIT = 'registerOrEdit',
  VALIDATE_ACCOUNT_DETAILS = 'validateAccountDetails',
  SHOW_REGISTRATION_VIEW = 'show_registration_view',
  CUSTOMIZE_PRODUCTS_OR_SKIP = 'customizeProductsOrSkip',
  CUSTOMIZE_PRODUCTS = 'customizeProducts',
  CONFIGURE_PAYMENT = 'configurePayment',
  CONFIRM_REGISTRATION = 'confirmRegistration',
  SUBMITTING = 'submitting',
  COMPLETED = 'completed',
  ERROR = 'error',
  SHOW_CANCELLATION_VIEW = 'showCancellationView',
}

export enum Events {
  ON_STEP_BACK = 'onStepBack',
  ON_EDIT_REGISTRATION_REQUESTED = 'onEditRegistrationRequested',
  ON_CANCEL_REGISTRATION_REQUESTED = 'onCancelRegistrationRequested',
  ON_SUBMIT_ACCOUNT_DETAILS = 'onSubmitAccountDetails',
  ON_SUBMIT_PRODUCT_SELECTION = 'onSubmitProductSelection',
  ON_SUBMIT_PAYMENT_DETAILS = 'onSubmitPaymentDetails',
  ON_CONFIRM_REGISTRATION = 'onConfirmRegistration',
  ON_USER_UPDATED = 'onUserUpdated',
}

const EventFlowMachine = createMachine({
  id: 'eventRegistration',
  initial: States.CHECK_REGISTRATION_STATUS,
  types: {} as {
    context: EventFlowMachineContext;
  },
  context: init => {
    const input = init.input as EventFlowMachineContext;
    return {
      ...input,
    };
  },

  states: {
    [States.CHECK_REGISTRATION_STATUS]: {
      description:
        'Fetch user registrations - check if user is already registered, or needs to re-register',
      invoke: {
        src: fromPromise(async ({ input }) => {
          const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
          const { user, eventInfo } = input;
          return sdk.registrations.getV3Registrations({
            userId: user.id!,
            eventId: eventInfo.id,
            includeProducts: true,
            includeEventInfo: true,
            includeOrders: true,
            includeUserInfo: true,
          });
        }),
        input: ({ context }) => ({ user: context.user, eventInfo: context.eventInfo }),
        onDone: {
          target: States.REGISTER_OR_EDIT,
          actions: assign({
            inEditMode: ({ event }) => event.output.data!.length > 0,
            registrations: ({ event }) => event.output.data!,
          }),
        },

        onError: {
          target: States.ERROR,
        },
      },
    },
    [States.REGISTER_OR_EDIT]: {
      description: 'Decide wether to edit or create a registration',
      always: [
        {
          guard: ({ context }) => context.inEditMode,
          target: States.SHOW_REGISTRATION_VIEW,
        },
        {
          guard: ({ context }) => !context.inEditMode,
          target: States.VALIDATE_ACCOUNT_DETAILS,
        },
      ],
    },
    [States.VALIDATE_ACCOUNT_DETAILS]: {
      on: {
        [Events.ON_SUBMIT_ACCOUNT_DETAILS]: {
          target: States.CUSTOMIZE_PRODUCTS_OR_SKIP,
          actions: assign({
            user: ({ event }) => event.user,
          }),
        },
      },
    },
    [States.SHOW_REGISTRATION_VIEW]: {
      on: {
        [Events.ON_EDIT_REGISTRATION_REQUESTED]: {
          target: States.CUSTOMIZE_PRODUCTS_OR_SKIP,
        },
        [Events.ON_CANCEL_REGISTRATION_REQUESTED]: {
          target: States.SHOW_CANCELLATION_VIEW,
        },
      },
    },
    [States.SHOW_CANCELLATION_VIEW]: {
      on: {
        [Events.ON_STEP_BACK]: {
          target: States.SHOW_REGISTRATION_VIEW,
        },
      },
    },
    [States.CUSTOMIZE_PRODUCTS_OR_SKIP]: {
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
        [Events.ON_STEP_BACK]: {
          target: States.REGISTER_OR_EDIT,
        },
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
        [Events.ON_STEP_BACK]: {
          target: States.CUSTOMIZE_PRODUCTS,
        },
        [Events.ON_SUBMIT_PAYMENT_DETAILS]: {
          target: States.CONFIRM_REGISTRATION,
          actions: assign({
            paymentFormValues: ({ event }) => event.formValues,
          }),
        },
      },
    },
    [States.CONFIRM_REGISTRATION]: {
      on: {
        [Events.ON_STEP_BACK]: {
          target: States.CONFIGURE_PAYMENT,
        },
        [Events.ON_CONFIRM_REGISTRATION]: {
          target: States.SUBMITTING,
        },
      },
    },
    [States.SUBMITTING]: {
      invoke: {
        id: 'submitEventRegistration',
        src: fromPromise(async ({ input }) => {
          const {
            user,
            eventInfo,
            paymentFormValues,
            selectedProducts,
            inEditMode,
            registrations,
          } = input as EventFlowMachineContext;
          if (!inEditMode) {
            const newRegistrationData = mapToNewRegistration(
              user.id!,
              eventInfo.id!,
              paymentFormValues
            );
            return createEventRegistration(newRegistrationData, selectedProducts);
          } else {
            const registration = registrations[0];
            const updatedRegistration = mapToUpdatedRegistration(registration, paymentFormValues);

            return updateEventRegistration(
              registration.registrationId!,
              updatedRegistration,
              input.availableProducts,
              selectedProducts
            );
          }
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

export default EventFlowMachine;

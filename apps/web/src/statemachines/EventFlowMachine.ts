import { assign, createMachine, fromPromise } from 'xstate';

import { fetchUserEventRegistrations } from '@/app/(admin)/admin/actions/registrations';
import { createEventRegistration, updateEventRegistration } from '@/app/(user)/user/events/actions';
import { EventDto, ProductDto, RegistrationDto, UserDto } from '@/lib/eventuras-sdk';
import { EventInfoStatus, PaymentProvider } from '@/lib/eventuras-types';
import { PaymentFormValues } from '@/types';
import { mapToNewRegistration, mapToUpdatedRegistration } from '@/utils/api/mappers';

type EventFlowMachineInput = {
  eventInfo: EventDto;
  user: UserDto;
  availableProducts: ProductDto[];
};

export type EventFlowMachineContext = {
  eventInfo: EventDto;
  user: UserDto;
  inEditMode: boolean;
  registrations: RegistrationDto[];
  availableProducts: ProductDto[];
  selectedProducts: Map<string, number>;
  paymentFormValues: PaymentFormValues;
  result: RegistrationDto | null;
  error: Error | null;
};

function getSelectedProductsMap(registration?: RegistrationDto | null): Map<string, number> {
  const selectedProducts = new Map<string, number>();

  registration?.products?.forEach(product => {
    if (product.productId == null) {
      return;
    }

    selectedProducts.set(product.productId.toString(), Number(product.quantity ?? 0));
  });

  return selectedProducts;
}

function toFlowError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string' && error.trim()) {
    return new Error(error);
  }

  return new Error('Unknown event registration flow error');
}

function getInitialPaymentFormValues(user: UserDto): PaymentFormValues {
  return {
    username: user.name ?? '',
    email: user.email ?? '',
    phoneNumber: user.phoneNumber ?? '',
    city: '',
    zip: '',
    country: 'Norway',
    vatNumber: '',
    invoiceReference: '',
    paymentMethod: PaymentProvider.POWER_OFFICE_EMAIL_INVOICE,
  };
}

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
    const input = init.input as EventFlowMachineInput;
    return {
      eventInfo: input.eventInfo,
      user: input.user,
      inEditMode: false,
      registrations: [],
      availableProducts: input.availableProducts ?? [],
      selectedProducts: new Map<string, number>(),
      paymentFormValues: getInitialPaymentFormValues(input.user),
      result: null,
      error: null,
    };
  },

  states: {
    [States.CHECK_REGISTRATION_STATUS]: {
      description:
        'Fetch user registrations - check if user is already registered, or needs to re-register',
      invoke: {
        src: fromPromise(async ({ input }) => {
          const { user, eventInfo } = input;
          const result = await fetchUserEventRegistrations(user.id!, eventInfo.id!);

          if (!result.success) {
            throw new Error(result.error.message);
          }

          return result.data;
        }),
        input: ({ context }) => ({ user: context.user, eventInfo: context.eventInfo }),
        onDone: {
          target: States.REGISTER_OR_EDIT,
          actions: assign({
            inEditMode: ({ event }) => event.output.length > 0,
            registrations: ({ event }) => event.output,
            selectedProducts: ({ event }) => getSelectedProductsMap(event.output[0]),
            error: () => null,
          }),
        },

        onError: {
          target: States.ERROR,
          actions: assign({
            error: ({ event }) => toFlowError(event.error),
          }),
        },
      },
    },
    [States.REGISTER_OR_EDIT]: {
      description:
        'Decide whether to edit or create a registration based on context and event status',
      always: [
        {
          // User has an existing registration, show the registration view
          guard: ({ context }) => context.inEditMode,
          target: States.SHOW_REGISTRATION_VIEW,
        },
        {
          // No existing registration, but event registration status allows creating new
          guard: ({ context }) =>
            !context.inEditMode &&
            (context.eventInfo.status === EventInfoStatus.REGISTRATIONS_OPEN ||
              context.eventInfo.status === EventInfoStatus.WAITING_LIST),
          target: States.VALIDATE_ACCOUNT_DETAILS,
        },
        {
          // Needs an better error message
          guard: ({ context }) =>
            !context.inEditMode &&
            context.eventInfo.status !== EventInfoStatus.REGISTRATIONS_OPEN &&
            context.eventInfo.status !== EventInfoStatus.WAITING_LIST,
          target: States.ERROR,
          actions: assign({
            error: ({ context }) =>
              new Error(
                `Registration unavailable because event status is ${context.eventInfo.status}`
              ),
          }),
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

          let result;

          if (!inEditMode) {
            const newRegistrationData = mapToNewRegistration(
              user.id!,
              eventInfo.id!,
              paymentFormValues
            );
            result = await createEventRegistration(newRegistrationData, selectedProducts);
          } else {
            const registration = registrations[0];
            const updatedRegistration = mapToUpdatedRegistration(registration!, paymentFormValues);

            result = await updateEventRegistration(
              registration!.registrationId!,
              updatedRegistration,
              input.availableProducts,
              selectedProducts
            );
          }

          // Handle server action result
          if (!result.success) {
            throw new Error(result.error.message);
          }

          return result.data;
        }),
        input: ({ context }) => ({ ...context }),
        onDone: {
          target: States.CHECK_REGISTRATION_STATUS,
          actions: assign({
            result: ({ event }) => event.output,
            error: () => null,
          }),
        },
        onError: {
          target: States.ERROR,
          actions: assign({
            error: ({ event }) => toFlowError(event.error),
          }),
        },
      },
    },
    [States.ERROR]: {
      type: 'final',
    },
  },
});

export default EventFlowMachine;

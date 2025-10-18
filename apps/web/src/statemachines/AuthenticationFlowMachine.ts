import { UserDto } from '@eventuras/sdk';
import { useSelector } from '@xstate/react';
import { createContext, useContext } from 'react';
import { Actor, assign, createMachine, fromPromise } from 'xstate';

import { createSDK } from '@/utils/api/EventurasApi';
import { publicEnv } from '@/config.client';

type SessionUser = {
  name: string;
  email: string;
  image?: string;
  id: string;
};

export type AuthenticationFlowMachineContext = {
  idToken: string;
  isAdmin: boolean;
  sessionUser: SessionUser | null;
  userProfile: UserDto | null;
};

const initialContext: AuthenticationFlowMachineContext = {
  idToken: '',
  isAdmin: false,
  sessionUser: null,
  userProfile: null,
};

export enum States {
  AUTHENTICATED = 'authenticated',
  NOT_AUTHENTICATED = 'not authenticated',
}

export enum Events {
  ON_LOGGED_IN_SUCCESS = 'onLoggedinSuccess',
  ON_LOGGED_OUT = 'onLoggedOut',
}

const AuthenticationFlowMachine = createMachine({
  id: 'authenticationFlow',
  initial: States.NOT_AUTHENTICATED,
  types: {} as {
    context: AuthenticationFlowMachineContext;
  },
  context: init => {
    const input = init.input as AuthenticationFlowMachineContext;
    return {
      ...input,
    };
  },
  states: {
    [States.NOT_AUTHENTICATED]: {
      on: {
        [Events.ON_LOGGED_IN_SUCCESS]: {
          target: States.AUTHENTICATED,
          actions: assign({
            idToken: ({ event }) => event.session?.id_token,
            isAdmin: ({ event }) => event.session?.roles?.indexOf('Admin') > -1,
            sessionUser: ({ event }) => event.session?.user,
          }),
        },
      },
    },
    [States.AUTHENTICATED]: {
      on: {
        [Events.ON_LOGGED_OUT]: {
          target: States.NOT_AUTHENTICATED,
          actions: assign(() => initialContext),
        },
      },
      invoke: {
        src: fromPromise(async ({ input }) => {
          const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
          return sdk.userProfile.getV3Userprofile({
            eventurasOrgId: parseInt(publicEnv.NEXT_PUBLIC_ORGANIZATION_ID as string, 10),
          });
        }),
        onDone: {
          actions: assign({
            userProfile: ({ event }) => event.output,
          }),
        },
        onError: {
          target: States.NOT_AUTHENTICATED,
          actions: assign(() => initialContext),
        },
      },
    },
  },
});

export const AuthenticationStateContext = createContext({
  auth: {} as Actor<typeof AuthenticationFlowMachine>,
});
export const useAuthSelector = (): AuthenticationFlowMachineContext & {
  isAuthenticated: boolean;
} => {
  const { auth } = useContext(AuthenticationStateContext);
  return useSelector(auth, snapshot => {
    const { idToken, isAdmin, sessionUser, userProfile } = snapshot.context;
    return {
      isAuthenticated: snapshot.value === States.AUTHENTICATED,
      idToken,
      isAdmin,
      sessionUser,
      userProfile,
    };
  });
};

export default AuthenticationFlowMachine;

'use client';

import { useEffect, useRef } from 'react';
import { useActor } from '@xstate/react';

import { EventDto, ProductDto, UserDto } from '@eventuras/event-sdk';

import EventFlowMachine, { Events, States } from '@/statemachines/EventFlowMachine';

import { logStateTransition, logStepError } from '../lib/eventFlowLogger';

export interface UseEventFlowMachineProps {
  eventInfo: EventDto;
  user: UserDto;
  availableProducts: ProductDto[];
}

/**
 * Custom hook to manage event flow state machine with logging and error handling
 */
export function useEventFlowMachine({
  eventInfo,
  user,
  availableProducts,
}: UseEventFlowMachineProps) {
  const [state, send] = useActor(EventFlowMachine, {
    input: {
      eventInfo,
      user,
      availableProducts,
    },
  });

  const previousStateRef = useRef<string>(String(state.value));

  // Log state transitions
  useEffect(() => {
    const currentStateValue = String(state.value);

    if (
      currentStateValue !== 'checkRegistrationStatus' &&
      previousStateRef.current !== currentStateValue
    ) {
      logStateTransition(previousStateRef.current, currentStateValue, undefined, {
        eventId: eventInfo.id,
        userId: user.id,
        inEditMode: state.context.inEditMode,
      });
      previousStateRef.current = currentStateValue;
    }
  }, [state.value, eventInfo.id, user.id, state.context.inEditMode]);

  // Log errors when entering error state
  useEffect(() => {
    if (state.matches(States.ERROR) && state.context.error) {
      logStepError('ERROR', 'EventFlow', state.context.error, {
        eventId: eventInfo.id,
        userId: user.id,
      });
    }
  }, [state, eventInfo.id, user.id]);

  return {
    state,
    send,
    context: state.context,
    isLoading: state.matches(States.SUBMITTING) || state.matches(States.CHECK_REGISTRATION_STATUS),
    isError: state.matches(States.ERROR),
    currentState: String(state.value),
    States,
    Events,
  };
}

import { Logger } from '@eventuras/logger';

/**
 * Centralized logger for event flow
 * All event registration flow logging goes through this logger
 */
export const eventFlowLogger = Logger.create({
  namespace: 'web:user:events:flow',
  context: { module: 'EventFlow' },
});

type LogContext = Record<string, string | number | boolean | undefined | null>;

/**
 * Log step entry with context
 */
export function logStepEntry(step: number | string, stepName: string, context?: LogContext) {
  eventFlowLogger.info(
    {
      step,
      stepName,
      ...context
    },
    `[STEP ${step}] Entering ${stepName}`
  );
}

/**
 * Log step completion with context
 */
export function logStepComplete(step: number | string, stepName: string, context?: LogContext) {
  eventFlowLogger.info(
    {
      step,
      stepName,
      ...context
    },
    `[STEP ${step}] Completed ${stepName}`
  );
}

/**
 * Log step error with full context
 */
export function logStepError(
  step: number | string,
  stepName: string,
  error: Error | unknown,
  context?: LogContext
) {
  eventFlowLogger.error(
    {
      step,
      stepName,
      error,
      ...context
    },
    `[STEP ${step}] Error in ${stepName}`
  );
}

/**
 * Log state machine transition
 */
export function logStateTransition(
  from: string,
  to: string,
  event?: string,
  context?: LogContext
) {
  eventFlowLogger.info(
    {
      from,
      to,
      event,
      ...context
    },
    `State transition: ${from} → ${to}${event ? ` (${event})` : ''}`
  );
}

/**
 * Log user action
 */
export function logUserAction(action: string, context?: LogContext) {
  eventFlowLogger.info(
    {
      action,
      ...context
    },
    `User action: ${action}`
  );
}

export default eventFlowLogger;

/**
 * Common types for server actions
 *
 * Provides a standardized interface for server action responses
 * that supports both success and error states with proper typing.
 */

/**
 * Success result from a server action
 */
export type ServerActionSuccess<T = void> = {
  success: true;
  data: T;
  message?: string;
};

/**
 * Error result from a server action
 */
export type ServerActionError = {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

/**
 * Result type for server actions that can succeed or fail
 *
 * @example
 * // In server action
 * export async function createEvent(formData: FormData): Promise<ServerActionResult<{ eventId: number }>> {
 *   try {
 *     const event = await api.createEvent(...);
 *     return { success: true, data: { eventId: event.id } };
 *   } catch (error) {
 *     return { success: false, error: { message: 'Failed to create event' } };
 *   }
 * }
 *
 * // In client component
 * const result = await createEvent(formData);
 * if (result.success) {
 *   toast.success('Event created!');
 *   router.push(`/admin/events/${result.data.eventId}`);
 * } else {
 *   toast.error(result.error.message);
 * }
 */
export type ServerActionResult<T = void> = ServerActionSuccess<T> | ServerActionError;

/**
 * Helper to create a success result
 */
export function actionSuccess<T>(data: T, message?: string): ServerActionSuccess<T> {
  return { success: true, data, message };
}

/**
 * Helper to create an error result
 */
export function actionError(message: string, code?: string, details?: unknown): ServerActionError {
  return {
    success: false,
    error: { message, code, details },
  };
}

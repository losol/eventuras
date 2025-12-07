/**
 * Standard result type for server actions
 */
export type ServerActionResult<T = void> =
  | {
      success: true;
      data: T;
      message?: string;
    }
  | {
      success: false;
      error: {
        message: string;
        code?: string;
        details?: unknown;
      };
    };

/**
 * Create a successful server action result
 */
export function actionSuccess<T>(data: T, message?: string): ServerActionResult<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

/**
 * Create an error server action result
 */
export function actionError(
  message: string,
  code?: string,
  details?: unknown,
): ServerActionResult<never> {
  const error: { message: string; code?: string; details?: unknown } = { message };
  if (code !== undefined) error.code = code;
  if (details !== undefined) error.details = details;

  return {
    success: false,
    error,
  };
}

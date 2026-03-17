export const CORRELATION_ID_HEADER = 'X-Correlation-Id';

export function createCorrelationId(): string {
  return crypto.randomUUID();
}

export function readCorrelationIdFromResponse(response: Response): string | null {
  return response.headers.get(CORRELATION_ID_HEADER);
}

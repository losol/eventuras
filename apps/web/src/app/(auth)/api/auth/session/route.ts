import { auth } from '@/utils/auth/fidesAuth';

/** Whether there is a session, and whose. The browser auth store asks here. */
export async function GET(request: Request): Promise<Response> {
  return auth.handleSessionInfo(request);
}

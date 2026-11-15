import { auth } from '@/utils/auth/fidesAuth';

/** RP-initiated logout: ends the session and redirects to the provider. POST-only. */
export function POST(request: Request): Promise<Response> {
  return auth.handleOidcLogout(request);
}

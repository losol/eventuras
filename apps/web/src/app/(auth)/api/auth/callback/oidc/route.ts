import { auth } from '@/utils/auth/fidesAuth';

export function GET(request: Request): Promise<Response> {
  return auth.handleOidcCallback(request);
}

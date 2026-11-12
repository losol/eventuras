import { auth } from '@/utils/auth/fidesAuth';

export async function GET(request: Request): Promise<Response> {
  return auth.handleOidcLogin(request);
}

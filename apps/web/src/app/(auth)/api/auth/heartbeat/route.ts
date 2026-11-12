import { auth } from '@/utils/auth/fidesAuth';

export async function POST(request: Request): Promise<Response> {
  return auth.handleHeartbeat(request);
}

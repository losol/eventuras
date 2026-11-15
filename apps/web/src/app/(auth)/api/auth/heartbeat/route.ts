import { auth } from '@/utils/auth/fidesAuth';

export function POST(request: Request): Promise<Response> {
  return auth.handleHeartbeat(request);
}

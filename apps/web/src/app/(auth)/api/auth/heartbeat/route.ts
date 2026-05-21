import { handleHeartbeat } from '@eventuras/fides-auth-next/heartbeat-handler';

import { oauthConfig } from '@/utils/oauthConfig';

export async function POST(request: Request): Promise<Response> {
  return handleHeartbeat(request, { oauthConfig });
}

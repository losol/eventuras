import { NextResponse } from 'next/server';

import { checkAuthorization } from '@/utils/auth/checkAuthorization';

/**
 * Build and runtime version info. Requires Admin role.
 * GET /api/system/version
 */
export async function GET() {
  const auth = await checkAuthorization('Admin');

  if (!auth.authorized) {
    const status = auth.error === 'Not authenticated' ? 401 : 403;
    return NextResponse.json({ error: auth.error ?? 'Forbidden' }, { status });
  }

  return NextResponse.json({
    version: process.env.BUILD_VERSION ?? 'unknown',
    gitSha: process.env.BUILD_GIT_SHA ?? 'unknown',
    buildTime: process.env.BUILD_TIME ?? 'unknown',
    imageTag: process.env.IMAGE_TAG ?? 'unknown',
  });
}

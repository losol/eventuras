import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Kubernetes liveness and readiness probes, and for
 * the CD gate to verify which build is actually serving. Unauthenticated: a git
 * SHA and image tag are not sensitive.
 * GET /api/healthz
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      gitSha: process.env.BUILD_GIT_SHA ?? 'unknown',
      imageTag: process.env.IMAGE_TAG ?? 'unknown',
    },
    { status: 200 }
  );
}

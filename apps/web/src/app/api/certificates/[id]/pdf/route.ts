import { NextRequest, NextResponse } from 'next/server';

import {
  CORRELATION_ID_HEADER,
  createCorrelationId,
  readCorrelationIdFromResponse,
} from '@/lib/correlation-id';
import { getAccessToken } from '@/utils/getAccesstoken';

function errorResponse(error: string, status: number, correlationId: string) {
  return NextResponse.json(
    { error, correlationId },
    { status, headers: { [CORRELATION_ID_HEADER]: correlationId } }
  );
}

/**
 * Proxies PDF certificate requests to the backend API,
 * so the backend doesn't need to be publicly exposed.
 * GET /api/certificates/:id/pdf
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const correlationId = _request.headers.get(CORRELATION_ID_HEADER) ?? createCorrelationId();

  if (!/^\d+$/.test(id)) {
    return errorResponse('Invalid certificate ID', 400, correlationId);
  }

  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    return errorResponse('Backend URL not configured', 500, correlationId);
  }

  const token = await getAccessToken();
  if (!token) {
    return errorResponse('Authentication required', 401, correlationId);
  }

  let response: Response;
  try {
    response = await fetch(`${backendUrl}/v3/certificates/${id}?format=Pdf`, {
      headers: {
        Accept: 'application/pdf',
        Authorization: `Bearer ${token}`,
        [CORRELATION_ID_HEADER]: correlationId,
      },
    });
  } catch {
    return errorResponse('Certificate service is currently unavailable', 502, correlationId);
  }

  const backendCorrelationId = readCorrelationIdFromResponse(response) ?? correlationId;

  if (!response.ok) {
    return errorResponse('Failed to fetch certificate PDF', response.status, backendCorrelationId);
  }

  if (!response.body) {
    return errorResponse('Failed to read certificate PDF stream', 502, backendCorrelationId);
  }

  return new NextResponse(response.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="certificate-${id}.pdf"`,
      'Cache-Control': 'private, no-store',
      [CORRELATION_ID_HEADER]: backendCorrelationId,
    },
  });
}

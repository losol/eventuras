import { NextRequest, NextResponse } from 'next/server';

import { getAccessToken } from '@/utils/getAccesstoken';

/**
 * Proxies PDF certificate requests to the backend API,
 * so the backend doesn't need to be publicly exposed.
 * GET /api/certificates/:id/pdf
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid certificate ID' }, { status: 400 });
  }

  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    return NextResponse.json({ error: 'Backend URL not configured' }, { status: 500 });
  }

  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let response: Response;
  try {
    response = await fetch(`${backendUrl}/v3/certificates/${id}?format=Pdf`, {
      headers: {
        Accept: 'application/pdf',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Certificate service is currently unavailable' },
      { status: 502 }
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch certificate PDF' },
      { status: response.status }
    );
  }

  if (!response.body) {
    return NextResponse.json({ error: 'Failed to read certificate PDF stream' }, { status: 502 });
  }

  return new NextResponse(response.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="certificate-${id}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}

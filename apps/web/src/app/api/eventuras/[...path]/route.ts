import { NextRequest, NextResponse } from 'next/server';

import { Debug } from '@eventuras/logger';

import { appConfig } from '@/config.server';
import { getAccessToken } from '@/utils/getAccesstoken';

const debug = Debug.create('web:api:forwarder');
const eventurasAPI_URL = appConfig.env.NEXT_PUBLIC_BACKEND_URL as string;

function isValidURL(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Forwards requests from /api/venturas to the eventuras backend API, decorating with a bearer token if available
 */

async function forwarder(request: NextRequest) {
  if (!eventurasAPI_URL) throw new Error('NEXT_PUBLIC_BACKEND_URL is not defined');

  // validate URL
  if (!isValidURL(request.url) || !isValidURL(eventurasAPI_URL)) {
    throw new Error('Invalid URL');
  }

  const forwardUrl = request.url.replace(/^.*?\/api\/eventuras/, eventurasAPI_URL);
  const acceptHeaders = request.headers.get('Accept');
  const hasAcceptHeaders = (acceptHeaders ?? '').toString().length > 0;
  const isBlob =
    acceptHeaders === 'application/pdf' ||
    acceptHeaders === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  /**
   * request issue with next13, will have to run json on the request body first:
   * https://stackoverflow.com/questions/75899415/decode-readablestream-object-nextjs-13-api-route
   *
   */

  const jBody = await request.json().catch(() => {
    return NextResponse.json({ error: 'Request body needs to be JSON' });
  });

  const contentType =
    request.method === 'PATCH' ? 'application/json-patch+json' : 'application/json';
  const forwardAccept = hasAcceptHeaders ? { Accept: acceptHeaders! } : null;
  const token = await getAccessToken();

  // Get organization ID with proper handling
  const organizationId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;
  const orgIdHeader =
    typeof organizationId === 'number'
      ? organizationId.toString()
      : ((organizationId as string) ?? '');

  const fResponse = await fetch(forwardUrl, {
    method: request.method,
    body: request.method === 'GET' ? null : JSON.stringify(jBody),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': contentType,
      'Eventuras-Org-Id': orgIdHeader,
      ...forwardAccept,
    },
    redirect: 'manual',
  });
  let data = null;

  if (!isBlob) {
    data = await fResponse.json().catch(() => {
      return null;
    });
    if (!data) {
      data = await fResponse.text().catch(() => {
        return null;
      });
    }
  } else {
    data = await fResponse.blob();
  }

  debug(
    'Request forwarded: %s %s -> %d %s',
    request.method,
    forwardUrl,
    fResponse.status,
    isBlob ? '[BLOB]' : JSON.stringify(data)
  );

  const init: ResponseInit = {
    status: fResponse.status,
    statusText: fResponse.statusText,
    headers: fResponse.headers,
  };
  const res: NextResponse = new NextResponse(isBlob ? data : JSON.stringify(data), init);
  return res;
}

export {
  forwarder as DELETE,
  forwarder as GET,
  forwarder as PATCH,
  forwarder as POST,
  forwarder as PUT,
};

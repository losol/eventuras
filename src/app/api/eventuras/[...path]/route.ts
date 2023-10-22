import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import Environment, { EnvironmentVariables } from '@/utils/Environment';
import Logger from '@/utils/Logger';

const eventurasAPI_URL = Environment.get(EnvironmentVariables.API_BASE_URL);

function isValidURL(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Forwards requests from /api/venturas to the eventuras backend API, decorating with a bearer token if available
 */

async function forwarder(request: NextRequest) {
  const token = await getToken({ req: request });
  const accessToken = token?.access_token ?? '';

  if (!eventurasAPI_URL) throw new Error('API_BASE_URL is not defined');

  // validate URL
  if (!isValidURL(request.url) || !isValidURL(eventurasAPI_URL)) {
    throw new Error('Invalid URL');
  }

  const forwardUrl = request.url.replace(/^.*?\/api\/eventuras/, eventurasAPI_URL);
  /**
   * request issue with next13, will have to run json on the request body first:
   * https://stackoverflow.com/questions/75899415/decode-readablestream-object-nextjs-13-api-route
   *
   */

  const jBody = await request.json().catch(() => {
    return NextResponse.json({ error: 'Request body needs to be JSON' });
  });
  const fResponse = await fetch(forwardUrl, {
    method: request.method,
    body: request.method === 'GET' ? null : JSON.stringify(jBody),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json', //default to json
      'Eventuras-Org-Id': Environment.get(EnvironmentVariables.NEXT_PUBLIC_ORGANIZATION_ID),
    },
    redirect: 'manual',
  });

  let data = await fResponse.json().catch(() => {
    return null;
  });
  if (!data) {
    data = await fResponse.text().catch(() => {
      return null;
    });
  }

  if (Environment.get(EnvironmentVariables.NODE_ENV) === 'development') {
    //dev only, avoid token leaks into anything else than dev environment
    Logger.info(
      {
        developerOnly: true,
        namespace: 'api:forwarder',
      },
      {
        forwardUrl,
        body: JSON.stringify(jBody),
        method: request.method,
        status: fResponse.status,
        data,
        accessToken,
      }
    );
  }

  const init: ResponseInit = {
    status: fResponse.status,
    statusText: fResponse.statusText,
    headers: fResponse.headers,
  };
  const res: NextResponse = new NextResponse(JSON.stringify(data), init);
  return res;
}

export {
  forwarder as DELETE,
  forwarder as GET,
  forwarder as PATCH,
  forwarder as POST,
  forwarder as PUT,
};

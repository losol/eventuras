import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const eventurasAPI_URL = process.env.API_BASE_URL;

/**
 * Forwards requests from /api/venturas to the eventuras backend API, decorating with a bearer token if available
 */
async function forwarder(request: NextRequest) {
  const token = await getToken({ req: request });
  const accessToken = token?.accessToken ?? '';

  if (!eventurasAPI_URL) throw new Error('API_BASE_URL is not defined');

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

  if (process.env.NODE_ENV === 'development') {
    //dev only, avoid token leaks into anything else than dev environment
    console.log({
      forwardUrl,
      body: jBody,
      method: request.method,
      status: fResponse.status,
      data,
      accessToken,
    });
  }

  const init: ResponseInit = {
    status: fResponse.status,
    statusText: fResponse.statusText,
    headers: fResponse.headers,
  };
  const res: NextResponse = new NextResponse(JSON.stringify(data), init);
  return res;
}

export { forwarder as GET, forwarder as POST };

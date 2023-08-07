//import { authOptions } from 'app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
//import { getServerSession } from 'next-auth/next';

const eventurasAPI_URL = process.env.API_BASE_URL;

/**
 * Forwards requests from /api/venturas to the eventuras backend API, decorating with a bearer token if available
 */
async function forwarder(request: NextRequest) {
  const token = await getToken({ req: request });
  const accessToken = token?.accessToken ?? '';

  if (!eventurasAPI_URL) throw new Error('API_BASE_URL is not defined');

  const forwardUrl = request.url.replace(/^.*?\/api\/eventuras/, eventurasAPI_URL);

  // TODO : return fetch
  const fResponse = await fetch(forwardUrl, {
    body: request.method === 'GET' ? null : request.body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    redirect: 'manual',
  });

  const data = await fResponse.json();
  if (process.env.NODE_ENV === 'development') {
    //dev only, avoid token leaks into anything else than dev environment
    //console.log(forwardUrl);
    //console.log({
    //  forwardUrl,
    //  body: request.body,
    //  method: request.method,
    //  status: fResponse.status,
    //  data,
    //  accessToken,
    //});
  }

  return { status: fResponse.status, data };
}

async function router(request: NextRequest) {
  //const session = await getServerSession(authOptions);
  const { status, data } = await forwarder(request);

  //if (status === 401) {
  //  return NextResponse.redirect('/api/auth/signin');
  //}

  if (status === 500) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export { router as GET, router as POST };

import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

/**
 * Forwards requests from /api/venturas to the eventuras backend API, decorating with a bearer token if available
 * @param req
 * @param res
 */
const forwarder = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const accessToken = token?.accessToken;
  const eventurasAPI_URL = process.env.API_BASE_URL;
  const forwardUrl = req.url?.replace('/api/eventuras', eventurasAPI_URL!);

  const fResponse = await fetch(forwardUrl!, {
    ...req,
    body: req.method === 'GET' ? null : req.body, //prevent issue where body is set on GET, which is not allowed
    headers: {
      Authorization: `Bearer ${accessToken}`, //if there is no token, it should not matter when a token is not required
      'Content-Type': 'application/json',
    },
    redirect: 'manual',
  });

  const data = await fResponse.json();
  if (process.env.NODE_ENV === 'development') {
    //dev only, avoid token leaks into anything else than dev environment
    console.log({
      forwardUrl,
      body: req.body,
      method: req.method,
      status: fResponse.status,
      data,
      accessToken,
    });
  }

  res.status(fResponse.status);
  res.send(data);
};

export default forwarder;

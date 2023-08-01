import { NextApiRequest, NextApiResponse } from 'next';
import { getToken, JWT } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;
let accessToken: JWT | null;

async function fetcher(route: string) {
  return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${route}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then(response => response.json())
    .then(result => {
      return result;
    });
}

const getRegistrations = async () => {
  return await fetcher('/v3/registrations');
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req, secret });
  accessToken = token;
  const data = await getRegistrations();
  res.status(200).json(data);
};

import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;
let accessToken;

async function fetcher(route) {
  const data = fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${route}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((result) => {
      return result;
    });

  return data;
}

const getEventurasData = async () => {
  const data = await fetcher('/v3/registrations');
  return data;
};

export default async (req, res) => {
  const token = await getToken({ req, secret });
  accessToken = token.accessToken;
  const data = getEventurasData();

  res.status(200).json(data);
};

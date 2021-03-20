import axios from 'axios';
// import { getSession } from 'next-auth/client';
import jwt from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;
let accessToken;

const getEventurasData = async (pageToken = '') => {
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/v3/registrations`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  console.log(data);

  return data.items;
};

export default async (req, res) => {
  const token = await jwt.getToken({ req, secret, raw: true });

  accessToken = token;
  console.log('thetoken: ' + token);
  const data = await getEventurasData();

  res.status(200).json(data);
};

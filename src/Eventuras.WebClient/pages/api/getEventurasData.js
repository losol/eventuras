import axios from 'axios';
import { getToken } from 'next-auth/jwt';

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
  const token = await getToken({ req, secret });
  accessToken = token.accessToken;
  console.log('thetoken: ' + accessToken);
  const data = await getEventurasData();

  res.status(200).json(data);
};

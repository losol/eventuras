import { fetcher } from '@lib/fetcher';

export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
}

export const getUser = async (
  userId: string,
  accessToken: string
): Promise<User> => {
  const user = await fetcher.get(`/v3/users/${userId}`, {
    accessToken: accessToken,
  });
  return user;
};

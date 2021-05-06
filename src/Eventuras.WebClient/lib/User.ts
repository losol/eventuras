import { fetcher } from '@lib/fetcher';

export interface User {
  id?: string;
  email: string;
  name: string;
  phoneNumber?: string;
}

export const getUser = async (
  userId: string,
  accessToken: string
): Promise<User> => {
  return await fetcher.get(`/v3/users/${userId}`, {
    accessToken: accessToken,
  });
};

const validateUser = (user: User) => {
  if (user.name.length < 5) {
    throw Error('Name is too short');
  }
  if (user.email.length < 5) {
    throw Error('Email is required');
  }
};

export const createUser = async (
  user: User,
  accessToken: string
): Promise<User> => {
  if (user.id) {
    throw Error('User has an id. Did you mean to update the user instead?');
  }
  validateUser(user);

  const newUser = fetcher.post(`/v3/users`, user, {
    accessToken: accessToken,
  });

  return newUser;
};

export const updateUser = async (
  user: User,
  accessToken: string
): Promise<User> => {
  if (!user.id) {
    throw Error('Missing user id.');
  }
  validateUser(user);

  const updatedUser = await fetcher.put(`/v3/users/${user.id}`, user, {
    accessToken: accessToken,
  });
  return updatedUser;
};

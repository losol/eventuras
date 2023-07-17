import { fetcher } from './fetcher';
import { UserType } from 'types';

export const getUserProfile = async (accessToken: string): Promise<UserType> => {
  return fetcher.get(`/v3/users/me`, {
    accessToken: accessToken,
  });
};

export const getUsers = async (accessToken: string): Promise<UserType> => {
  return fetcher.get(`/v3/users/`, {
    accessToken: accessToken,
  });
};

export const getUserById = async (
  userId: string,
  accessToken: string
): Promise<UserType> => {
  return fetcher.get(`/v3/users/${userId}`, {
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
): Promise<UserType> => {
  if (user.id) {
    throw Error('User has an id. Did you mean to update the user instead?');
  }
  validateUser(user);

  return fetcher.post(`/v3/users`, user, {
    accessToken: accessToken,
  });
};

export const updateUser = async (
  user: User,
  accessToken: string
): Promise<UserType> => {
  if (!user.id) {
    throw Error('Missing user id.');
  }
  validateUser(user);

  return fetcher.put(`/v3/users/${user.id}`, user, {
    accessToken: accessToken,
  });
};

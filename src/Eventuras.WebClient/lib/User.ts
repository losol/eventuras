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
  const response = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + `/v3/users/${userId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const user = await response.json();

  if (response.ok) {
    return user;
  } else {
    const error = new Error(response.status + ': ' + response.statusText);
    return Promise.reject(error);
  }
};

import { useSession } from 'next-auth/react';
import { createContext, useEffect, useState } from 'react';
import useSWR from 'swr';

export const UserContext = createContext({});
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const { data: session } = useSession();
  const { data: userDetails } = useSWR(session ? '/api/getUserProfile' : '');
  const updateUser = (updated_user) => {
    setUser(updated_user);
  };
  useEffect(() => {
    setUser(userDetails);
  }, [userDetails]);

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

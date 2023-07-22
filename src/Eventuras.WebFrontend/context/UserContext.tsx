import { useSession } from 'next-auth/react';
import { createContext, ReactNode, useEffect, useState } from 'react';
import useSWR from 'swr';
import { UserType } from 'types';

// interface UserProviderProps {
//   user: UserType; // TODO: Check does UserType fit API response
//   updateUser: (updated_user: UserType) => void;
// };

export const UserContext = createContext({});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Quick fix. TODO: With fresh mind think how to handle initialState, perfectly null
  const initialUser = {
    email: '',
    name: '',
    // phoneNumber: '',
  };
  const [user, setUser] = useState(initialUser);
  const { data: session } = useSession();
  const { data: userDetails } = useSWR(session ? '/api/getUserProfile' : '');
  const updateUser = (updated_user: UserType) => {
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

'use client';

import { createContext, ReactNode, useState } from 'react';
import { UserProfile } from 'types/UserProfile';

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
  const updateUser = (updated_user: UserProfile) => {
    setUser(updated_user);
  };

  return <UserContext.Provider value={{ user, updateUser }}>{children}</UserContext.Provider>;
};

'use client';

import { UserDto as UserProfile } from '@losol/eventuras';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { createContext, ReactNode, useCallback, useEffect, useState } from 'react';

import { getUserProfile } from '@/utils/api/functions/users';

// Auth type definition
interface Auth {
  isAuthenticated: boolean;
  session: SessionWithIdToken;
}

// UserState type definition
interface UserState {
  profile: UserProfile | null;
  auth: Auth | null;
  error: string | null; // Add an error field
}

type SessionWithIdToken = Session & { id_token: string };

// UserContextProps type definition
interface UserContextProps {
  userState: UserState;
  updateUserProfile: (updatedProfile: UserProfile) => void;
  updateAuthStatus: (newAuthStatus: Auth) => void;
  fetchUserProfile: () => Promise<void>;
}

// Default state values
const defaultUserState: UserState = {
  profile: null,
  auth: null,
  error: null,
};

const defaultUserContextValue: UserContextProps = {
  userState: defaultUserState,
  updateUserProfile: () => {},
  updateAuthStatus: () => {},
  fetchUserProfile: async () => {},
};

// UserContext definition
export const UserContext = createContext<UserContextProps>(defaultUserContextValue);

interface UserProviderProps {
  children: ReactNode;
}

// UserProvider component
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userState, setUserState] = useState<UserState>(defaultUserState);
  const { data: session } = useSession();

  const updateUserProfile = (updatedProfile: UserProfile) => {
    setUserState(prevState => ({
      ...prevState,
      profile: updatedProfile,
    }));
  };

  const updateAuthStatus = (newAuthStatus: Auth) => {
    setUserState(prevState => ({
      ...prevState,
      auth: {
        isAuthenticated: newAuthStatus.isAuthenticated ?? prevState.auth?.isAuthenticated ?? false,
        session: newAuthStatus.session,
      },
    }));
  };

  const fetchUserProfile = useCallback(async () => {
    if (session) {
      const result = await getUserProfile();
      const sessWId: SessionWithIdToken = session as SessionWithIdToken;
      if (result.ok) {
        updateUserProfile(result.value);
        updateAuthStatus({ isAuthenticated: true, session: sessWId });
      } else {
        setUserState(prevState => ({
          ...prevState,
          error: result.error.message,
        }));
      }
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (session) {
      fetchUserProfile();
    }
  }, [session?.accessToken]);

  return (
    <UserContext.Provider
      value={{ userState, updateUserProfile, updateAuthStatus, fetchUserProfile }}
    >
      {children}
    </UserContext.Provider>
  );
};

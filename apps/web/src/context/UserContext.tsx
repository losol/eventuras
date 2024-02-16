'use client';

import { ApiError, UserDto as UserProfile } from '@eventuras/sdk';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { createContext, ReactNode, useCallback, useEffect, useState } from 'react';

import { ApiResult, apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';

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
  roles: string[];
}

type SessionWithIdToken = Session & { id_token: string };

// UserContextProps type definition
interface UserContextProps {
  userState: UserState;
  updateUserProfile: (updatedProfile: UserProfile) => void;
  updateAuthStatus: (newAuthStatus: Auth) => void;
  fetchUserProfile: () => Promise<ApiResult<UserProfile, ApiError> | null>;
}

// Default state values
const defaultUserState: UserState = {
  profile: null,
  auth: null,
  error: null,
  roles: [],
};

const defaultUserContextValue: UserContextProps = {
  userState: defaultUserState,
  updateUserProfile: () => {},
  updateAuthStatus: () => {},
  fetchUserProfile: async () => {
    return null;
  },
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
  const sessionExists = session !== null;
  const updateUserProfile = (updatedProfile: UserProfile) => {
    setUserState(prevState => ({
      ...prevState,
      profile: updatedProfile,
      roles: session?.roles || [],
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

  const updateWithUserProfile = useCallback(async () => {
    if (session) {
      const result = await apiWrapper(() =>
        createSDK({ inferUrl: { enabled: true, requiresToken: true } }).userProfile.getV3Userprofile({
          eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10),
        })
      );
      const sessWId: SessionWithIdToken = session as SessionWithIdToken;
      if (result.ok) {
        updateUserProfile(result.value!);
        updateAuthStatus({ isAuthenticated: true, session: sessWId });
      } else {
        setUserState(prevState => ({
          ...prevState,
          error: result.error!.message,
        }));

        if (result.error!.status === 401) {
          //assume the token is for some reason no longer working, call nextauth signOut to force a session clean
          signOut();
        }
      }
      return result;
    }
    return null;
  }, [sessionExists]);
  useEffect(() => {
    if (session) {
      updateWithUserProfile();
    }
  }, [sessionExists]);

  return (
    <UserContext.Provider
      value={{
        userState,
        updateUserProfile,
        updateAuthStatus,
        fetchUserProfile: updateWithUserProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

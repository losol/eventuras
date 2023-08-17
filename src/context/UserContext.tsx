'use client';

import { UserDto as UserProfile } from '@losol/eventuras';
import { useSession } from 'next-auth/react';
import { createContext, ReactNode, useCallback, useEffect, useState } from 'react';

// Auth type definition
interface Auth {
  isAuthenticated: boolean;
}

// UserState type definition
interface UserState {
  profile: UserProfile | null;
  auth: Auth | null;
  error: string | null; // Add an error field
}

// UserContextProps type definition
interface UserContextProps {
  userState: UserState;
  updateUserProfile: (updatedProfile: UserProfile) => void;
  updateAuthStatus: (newAuthStatus: Partial<Auth>) => void;
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

// Extend UserProfile to include potential error
interface UserProfileResponse extends UserProfile {
  error?: string;
}

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

  const updateAuthStatus = (newAuthStatus: Partial<Auth>) => {
    setUserState(prevState => ({
      ...prevState,
      auth: {
        isAuthenticated: newAuthStatus.isAuthenticated ?? prevState.auth?.isAuthenticated ?? false,
      },
    }));
  };

  const fetchUserProfile = useCallback(async () => {
    if (session) {
      try {
        const response = await fetch('/api/user/getUserProfile');
        const data: UserProfileResponse = await response.json();

        if (response.ok) {
          updateUserProfile(data);
          updateAuthStatus({ isAuthenticated: true });
        } else {
          setUserState(prevState => ({
            ...prevState,
            error: data.error || 'Failed to fetch user profile',
          }));
        }
      } catch (error: any) {
        setUserState(prevState => ({
          ...prevState,
          error: error.message || 'Error fetching user profile',
        }));
      }
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchUserProfile();
    }
  }, [session, fetchUserProfile]);

  return (
    <UserContext.Provider
      value={{ userState, updateUserProfile, updateAuthStatus, fetchUserProfile }}
    >
      {children}
    </UserContext.Provider>
  );
};

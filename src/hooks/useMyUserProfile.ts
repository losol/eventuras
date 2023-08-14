import { OpenAPI } from '@losol/eventuras';
import { useEffect, useState } from 'react';

import { UserProfile } from '@/types/UserProfile';
import apiResponseHandler from '@/utils/apiResponseHandler';

const getAPIUserProfile = () => fetch(`${OpenAPI.BASE}/${OpenAPI.VERSION}/users/me`);

const useMyUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const getMyUserProfile = async () => {
      const profile: UserProfile = await getAPIUserProfile()
        .then(apiResponseHandler)
        .catch(err => {
          console.log(err);
          return null;
        });
      console.log({ profile });
      setLoading(false);
      setUserProfile(profile);
    };
    getMyUserProfile();
  }, []);
  return { userProfile, loading };
};

export default useMyUserProfile;

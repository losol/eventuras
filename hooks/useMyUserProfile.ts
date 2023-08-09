import { OpenAPI } from '@losol/eventuras';
import { useEffect, useState } from 'react';
import { UserProfile } from 'types/UserProfile';

const getAPIUserProfile = () =>
  fetch(`${OpenAPI.BASE}/${process.env.NEXT_PUBLIC_API_VERSION}/users/me`).then(r => r.json());

const useMyUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const getMyUserProfile = async () => {
      const profile: UserProfile = await getAPIUserProfile().catch(err => {
        console.error(err);
        return null;
      });
      setLoading(false);
      setUserProfile(profile);
    };
    getMyUserProfile();
  }, []);
  return { userProfile, loading };
};

export default useMyUserProfile;

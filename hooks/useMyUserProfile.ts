import { OpenAPI } from '@losol/eventuras';
import { useEffect, useState } from 'react';

const getAPIUserProfile = () =>
  fetch(`${OpenAPI.BASE}/${process.env.NEXT_PUBLIC_API_VERSION}/users/me`).then(r => r.json());

const useMyUserProfile = () => {
  const [userProfile, setUserProfile] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  //TODO handle edge cases

  ///v3/users/me
  useEffect(() => {
    const getMyUserProfile = async () => {
      setLoading(true);
      const profile: any = await getAPIUserProfile().catch(err => {
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

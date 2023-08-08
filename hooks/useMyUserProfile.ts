import { useEffect, useState } from 'react';
import { UsersService } from '@losol/eventuras';

/*
  Consideration: this one maps ProductDto to RegistrationProduct (a 'view' type) directly.
  Makes it easier to inject directly into views, but less portable.
*/
const useMyUserProfile = () => {
  const [userProfile, setUserProfile] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  //TODO handle edge cases
  useEffect(() => {
    const getMyUserProfile = async () => {
      setLoading(true);
      const profile: any = await UsersService.getV3UsersMe();
      setLoading(false);
      setUserProfile(profile);
    };
    getMyUserProfile();
  }, []);
  return { userProfile, loading };
};

export default useMyUserProfile;

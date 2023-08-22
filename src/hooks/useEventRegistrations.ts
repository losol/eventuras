import { RegistrationDto } from '@losol/eventuras/models/RegistrationDto';
import { useEffect, useState } from 'react';

import { getUserRegistrations } from '@/utils/api/functions/registrations';

const useEventRegistrations = (userId?: any) => {
  const [userRegistrations, setReg] = useState<RegistrationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const execute = async () => {
      const result = await getUserRegistrations(userId!);
      setLoading(false);
      if (result.ok) {
        setReg(result.value.data!);
        return;
      }
      setReg([]);
    };
    if (userId && userId.length) {
      execute();
    }
  }, [userId]);
  return { loading, userRegistrations };
};

export default useEventRegistrations;

import { CancelablePromise } from '@losol/eventuras';
import { DependencyList, useEffect, useState } from 'react';

import { apiWrapper } from '@/utils/api/EventurasApi';

const useCreateHook = <T>(
  fetchFunction: () => CancelablePromise<T>,
  dependencies?: DependencyList | undefined,
  skipIfTrue?: () => boolean | undefined
) => {
  const [result, setResult] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const execute = async () => {
      setLoading(true);
      setResult(null);
      const result = await apiWrapper(fetchFunction);
      setLoading(false);

      if (result.ok) {
        setResult(result.value);
        return;
      }
      setResult(null);
    };
    if (skipIfTrue && skipIfTrue()) {
      return;
    }
    execute();
  }, dependencies ?? []);
  return { loading, result };
};

export default useCreateHook;

import { useEffect, useRef } from 'react';

// Any for now. If usePrevious will be used in code > TODO: Think, maybe write type
const usePrevious = (value: any) => {
  const ref = useRef();
  useEffect(() => (ref.current = value));
  return ref.current;
};

export default usePrevious;

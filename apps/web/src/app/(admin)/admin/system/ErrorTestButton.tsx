'use client';

import { useState } from 'react';

import { Button } from '@eventuras/ratio-ui/core/Button';

import { triggerErrorTest } from './actions';

export const ErrorTestButton = () => {
  const [result, setResult] = useState<string | null>(null);

  const handleClick = async () => {
    setResult('Sending...');
    const response = await triggerErrorTest();
    if (response.success) {
      setResult(
        `API returned status ${response.data.status} — check your error tracking dashboard.`
      );
    } else {
      setResult(`Failed: ${response.error.message}`);
    }
  };

  return (
    <div>
      <Button onClick={handleClick} variant="outline">
        Trigger test error
      </Button>
      {result && <p className="mt-2 text-sm">{result}</p>}
    </div>
  );
};

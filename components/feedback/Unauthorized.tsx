import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Unauthorized() {
  return (
    <Alert variant="destructive">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <AlertTitle>Bummer!</AlertTitle>
      <AlertDescription>No access...</AlertDescription>
    </Alert>
  );
}

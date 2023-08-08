import { Alert } from '@mantine/core';
import { IconHandStop } from '@tabler/icons-react';

export default function Unauthorized() {
  return (
    <Alert icon={<IconHandStop size={16} />} title="Bummer!" color="red" variant="filled">
      No access...
    </Alert>
  );
}

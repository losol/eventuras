import { nanoid } from 'nanoid';
import { Field } from 'payload';

// Define the field
const resourceId: Field = {
  name: 'resourceId',
  type: 'text',
  required: true,
  admin: {
    readOnly: true,
  },
  unique: true,
  defaultValue: () => nanoid(8),
};

export default resourceId;

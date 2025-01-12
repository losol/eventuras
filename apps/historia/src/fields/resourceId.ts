import { customAlphabet } from 'nanoid';
import { Field } from 'payload';

// Define the custom alphabet
const generateId = customAlphabet('123456789abcdefghijkmnpqrstuvwxyz', 6);

// Define the field
const resourceId: Field = {
  name: 'resourceId',
  type: 'text',
  required: true,
  admin: {
    readOnly: true,
  },
  unique: true,
  defaultValue: () => generateId(),
};

export default resourceId;

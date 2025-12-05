import { customAlphabet } from 'nanoid';
import type { Field } from 'payload';

// 7 chars, 34-char alphabet (lowercase + digits, no ambiguous chars) = 52 billion combinations
// ~0.1% collision chance at 10M records, case-insensitive for better UX
const generateId = customAlphabet('123456789abcdefghijkmnpqrstuvwxyz', 7);

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

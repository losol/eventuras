import type { Block } from 'payload';

import { image } from '@/fields/image';
import { richText } from '@/fields/richText';

export const InstructionBlock: Block = {
  slug: 'instruction',
  interfaceName: 'InstructionBlock',
  labels: {
    singular: 'Instruction Step',
    plural: 'Instruction Steps',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Step Title',
      required: true,
      localized: true,
      admin: {
        placeholder: 'e.g., "Mix dry ingredients", "Connect the cables"',
      },
    },
    image,
    richText({
      name: 'content',
      label: 'Instructions',
      required: false,
      localized: true,
    }),
  ],
};

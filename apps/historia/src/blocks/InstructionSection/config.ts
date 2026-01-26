import type { Block } from 'payload';

import { richText } from '@/fields/richText';
import { InstructionBlock } from '@/blocks/InstructionBlock/config';
import { ResourcesBlock } from '@/blocks/ResourcesBlock/config';

export const InstructionSection: Block = {
  slug: 'instructionSection',
  interfaceName: 'InstructionSectionBlock',
  labels: {
    singular: 'Instruction Section',
    plural: 'Instruction Sections',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      required: true,
      localized: true,
      admin: {
        placeholder: 'e.g., "Preparation", "Assembly", "Testing"',
      },
    },
    richText({
      name: 'description',
      label: 'Section Description',
      required: false,
      localized: true,
    }),
    {
      name: 'sectionContent',
      label: 'Section Content',
      type: 'blocks',
      blocks: [ResourcesBlock, InstructionBlock],
      admin: {
        description: 'Add resources and instruction steps for this section',
      },
    },
  ],
};

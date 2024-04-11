import type { Block, Field } from 'payload/types';

import richText from '../fields/richText';

export const Content: Block = {
  fields: [
    richText(),
  ],
  slug: 'content',
};

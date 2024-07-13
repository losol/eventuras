import type { Block } from 'payload/types';

import { richText } from '../fields/richText';

export const Content: Block = {
  fields: [
    richText(),
  ],
  slug: 'content',
};

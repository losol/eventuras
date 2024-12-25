import type { CollectionConfig } from 'payload';

import { anyone } from '../access/anyone';
import { admins } from '@/access/admins';
import { slugField } from '@/fields/slug';
import { image } from '@/fields/image';
import { richText } from '@/fields/richText';

export const Topics: CollectionConfig = {
  slug: 'topics',
  access: {
    create: admins,
    delete: admins,
    read: anyone,
    update: admins,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    ...slugField(),
    richText({ name: 'description' }),
    image,

  ],
};


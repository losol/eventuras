import type { CollectionConfig } from 'payload';

import { anyone } from '../access/anyone';
import { admins } from '@/access/admins';
import { slugField } from '@/fields/slug';
import { image } from '@/fields/image';
import { title } from '@/fields/title';
import { description } from '@/fields/description';

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
    title,
    ...slugField(),
    description,
    image,
  ],
};


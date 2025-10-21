import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { description } from '@/fields/description';
import { image } from '@/fields/image';
import resourceId from '@/fields/resourceId';
import { slugField } from '@/fields/slug';
import { title } from '@/fields/title';

import { anyone } from '../access/anyone';

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
    resourceId
  ],
};


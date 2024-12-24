import type { CollectionConfig } from 'payload';

import { anyone } from '../access/anyone';
import { admins } from '@/access/admins';

const Topics: CollectionConfig = {
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
  ],
};

export default Topics;

import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { anyone } from '@/access/anyone';
import { description } from '@/fields/description';
import { image } from '@/fields/image';
import { name } from '@/fields/name';
import resourceId from '@/fields/resourceId';
import { slugField } from '@/fields/slug';

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    name,
    description,
    image,
    ...slugField("name"),
    resourceId
  ],
};

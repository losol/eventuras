import type { CollectionConfig } from 'payload';
import { admins } from '@/access/admins';
import { anyone } from '@/access/anyone';
import { name } from '@/fields/name';
import { description } from '@/fields/description';
import { slugField } from '@/fields/slug';
import resourceId from '@/fields/resourceId';

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
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'The logo of the organization.',
      },
    },
    ...slugField(),
    resourceId
  ],
};

import type { CollectionConfig } from 'payload';
import { admins } from '@/access/admins';
import { anyone } from '@/access/anyone';
import { name } from '@/fields/name';
import { description } from '@/fields/description';
import { slugField } from '@/fields/slug';
import resourceId from '@/fields/resourceId';
import { image } from '@/fields/image';

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

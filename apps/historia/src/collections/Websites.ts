import type { CollectionConfig } from 'payload';
import { admins } from '../access/admins';
import { anyone } from '../access/anyone';
import { name } from '@/fields/name';
import { title } from '@/fields/title';
import { summary } from '@/fields/summary';
import { meta } from '@/fields/meta';

export const Websites: CollectionConfig = {
  slug: 'websites',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
  },
  fields: [
    name,
    title,
    summary,
    {
      name: 'domains',
      label: 'Domains',
      type: 'text',
      hasMany: true,
    },
    {
      name: 'homePage',
      label: 'Home Page',
      type: 'relationship',
      relationTo: 'pages',
      required: false,
    },
    meta,
  ],
};


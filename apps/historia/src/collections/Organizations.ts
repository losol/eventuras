import { CollectionConfig } from 'payload/types';
import { admins, anyone } from '../access';

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
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'The name of the organization.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'A description of the organization.',
      },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        description: 'The URL of the organization\'s official website.',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'The logo of the organization.',
      },
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'places',
      admin: {
        description: 'The location of the organization.',
      },
    },
  ],
};

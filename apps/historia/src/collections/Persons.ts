import type { CollectionConfig } from 'payload';
import { admins } from '../access/admins';
import { anyone } from '../access/anyone';
import { story } from '../fields/story';
import { image } from '../fields/image';

export const Persons: CollectionConfig = {
  slug: 'persons',
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
      label: 'Name',
    },
    image,
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'A brief description of the person.',
      },
    },
    {
      name: 'jobTitle',
      type: 'text',
      admin: {
        description: 'The job title of the person.',
      },
    },
    {
      name: 'employer',
      type: 'text',
      admin: {
        description: 'The employer of the person.',
      },
    },
    story,
  ],
};

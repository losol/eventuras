import { CollectionConfig } from 'payload/types';
import { admins, anyone } from '../access';
import { image } from '../fields/image';
import { story } from '../fields/story';

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
      admin: {
        description: 'The name of the person.',
      },
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
    story

  ],
};


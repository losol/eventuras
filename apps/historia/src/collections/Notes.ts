import { CollectionConfig } from 'payload';
import { admins } from '../access/admins';
import { anyone } from '../access/anyone';
import { contentPersons } from '../fields/contentPersons';
import { featuredImage } from '../fields/featuredImage';

export const Notes: CollectionConfig = {
  slug: 'notes',
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
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'The title of the note.',
      },
    },
    featuredImage,
    {
      name: 'content',
      type: 'richText',
      admin: {
        description: 'The main content of the note.',
      },
    },
    contentPersons
  ],
};


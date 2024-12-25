import type { CollectionConfig } from 'payload';
import { admins } from '../access/admins';
import { anyone } from '../access/anyone';
import { contentPersons } from '../fields/contentPersons';
import { image } from '../fields/image';

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
    },
    image,
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


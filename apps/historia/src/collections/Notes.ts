import { CollectionConfig } from 'payload/types';
import { admins } from '../access/admins';

const Notes: CollectionConfig = {
  slug: 'notes',
  access: {
    read: () => true,
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
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'An optional image related to the note.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        description: 'The main content of the note.',
      },
    },
    {
      name: 'contentPersons',
      type: 'relationship',
      relationTo: 'persons',
      hasMany: true,
      admin: {
        description: 'Persons related to the note.',
      },
    },
  ],
};

export default Notes;
